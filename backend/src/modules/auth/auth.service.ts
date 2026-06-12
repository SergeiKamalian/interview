import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { generateUniqueCompanySlug } from '../companies/company-slug.util';
import type { CompanyEntity } from '../companies/entities/company.entity';
import { CompaniesRepository } from '../companies/companies.repository';
import type { UserEntity } from '../users/entities/user.entity';
import { UsersRepository } from '../users/users.repository';
import { mapCompanyToGraphql, mapUserToGraphql } from './auth.mapper';
import { AuthErrorCode } from './constants';
import type { LoginInput } from './dto/login.input';
import type { RegisterInput } from './dto/register.input';
import { AuthJwtService } from './jwt.service';
import { PasswordService } from './password.service';
import { SessionsRepository } from './sessions.repository';
import type { AuthPayload, MePayload } from './types/auth-payload.type';
import type { RequestMeta } from './utils/request-meta.util';

export type AuthUserContext = {
  id: number;
  email: string;
  companyId: number;
};

export type AuthSessionResult = AuthPayload & {
  refreshToken: string;
};

export type RefreshTokenResult = {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly companiesRepository: CompaniesRepository,
    private readonly sessionsRepository: SessionsRepository,
    private readonly database: DatabaseService,
    private readonly passwordService: PasswordService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  async register(
    input: RegisterInput,
    meta: RequestMeta,
  ): Promise<AuthSessionResult> {
    const email = this.normalizeEmail(input.email);
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException({
        message: 'User with this email already exists',
        code: 'USER_EMAIL_EXISTS',
      });
    }

    const passwordHash = await this.passwordService.hash(input.password);
    const slug = await generateUniqueCompanySlug(
      input.companyName,
      (candidate) => this.companiesRepository.slugExists(candidate),
    );

    const { user, company } = await this.database.withTransaction(
      async (query) => {
        const createdCompany = await this.companiesRepository.create(
          { name: input.companyName.trim(), slug },
          query,
        );

        const createdUser = await this.usersRepository.create(
          {
            email,
            passwordHash,
            fullName: input.fullName.trim(),
          },
          query,
        );

        await this.companiesRepository.createMembership(
          {
            companyId: createdCompany.id,
            userId: createdUser.id,
            role: 'owner',
          },
          query,
        );

        return { user: createdUser, company: createdCompany };
      },
    );

    return this.issueAuthSession(user, company, meta);
  }

  async login(
    input: LoginInput,
    meta: RequestMeta,
  ): Promise<AuthSessionResult> {
    const email = this.normalizeEmail(input.email);
    const user = await this.usersRepository.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.verify(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const membership =
      await this.companiesRepository.findPrimaryMembershipForUser(user.id);

    if (!membership) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const company = await this.companiesRepository.findById(
      membership.companyId,
    );

    if (!company || !company.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueAuthSession(user, company, meta);
  }

  async refresh(
    refreshToken: string,
    meta: RequestMeta,
  ): Promise<RefreshTokenResult> {
    if (!refreshToken.trim()) {
      throw new UnauthorizedException({
        message: 'Refresh token cookie not found',
        code: AuthErrorCode.REFRESH_TOKEN_MISSING,
      });
    }

    const payload = await this.authJwtService.verifyRefreshToken(refreshToken);
    await this.assertUserActive(payload.sub);

    const session = await this.sessionsRepository.findMatchingSession(
      payload.sub,
      refreshToken,
    );

    if (!session) {
      throw new UnauthorizedException({
        message: 'Session is invalid or expired',
        code: AuthErrorCode.SESSION_INVALID_OR_EXPIRED,
      });
    }

    const tokens = await this.issueTokenPair(payload);
    const expiresAt = this.authJwtService.getRefreshTokenExpiresAt();

    await this.sessionsRepository.rotateSession(
      session.id,
      tokens.refreshToken,
      meta.userAgent,
      meta.ip,
      expiresAt,
    );

    return {
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(refreshToken: string | undefined): Promise<boolean> {
    if (!refreshToken?.trim()) {
      return true;
    }

    try {
      const payload =
        await this.authJwtService.verifyRefreshToken(refreshToken);
      const session = await this.sessionsRepository.findMatchingSession(
        payload.sub,
        refreshToken,
      );

      if (session) {
        await this.sessionsRepository.revokeSession(session.id);
      }
    } catch {
      return true;
    }

    return true;
  }

  async getMe(currentUser: AuthUserContext): Promise<MePayload> {
    const user = await this.usersRepository.findById(currentUser.id);

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    const company = await this.companiesRepository.findById(
      currentUser.companyId,
    );

    if (!company || !company.isActive) {
      throw new NotFoundException('Company not found');
    }

    return {
      user: mapUserToGraphql(user),
      company: mapCompanyToGraphql(company),
    };
  }

  verifyAccessToken(token: string) {
    return this.authJwtService.verifyAccessToken(token);
  }

  private async issueAuthSession(
    user: UserEntity,
    company: CompanyEntity,
    meta: RequestMeta,
  ): Promise<AuthSessionResult> {
    const tokens = await this.issueTokenPair({
      sub: user.id,
      companyId: company.id,
      email: user.email,
    });

    await this.sessionsRepository.createSession({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      userAgent: meta.userAgent,
      ip: meta.ip,
      expiresAt: this.authJwtService.getRefreshTokenExpiresAt(),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      user: mapUserToGraphql(user),
      company: mapCompanyToGraphql(company),
    };
  }

  private async issueTokenPair(payload: {
    sub: number;
    companyId: number;
    email: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.authJwtService.signAccessToken(payload),
      this.authJwtService.signRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  private async assertUserActive(userId: number): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
