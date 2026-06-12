import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { getEnv } from '../../common/config/env.schema';
import { AuthErrorCode } from './constants';

export type JwtPayload = {
  sub: number;
  companyId: number;
  email: string;
};

type NamedError = {
  name: string;
};

function hasErrorName(value: unknown): value is NamedError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as NamedError).name === 'string'
  );
}

@Injectable()
export class AuthJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signAccessToken(payload: JwtPayload): Promise<string> {
    const env = getEnv(this.configService);

    return this.jwtService.signAsync(payload, {
      secret: env.jwtSecret,
      expiresIn: env.jwtExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      algorithm: 'HS256',
    });
  }

  signRefreshToken(payload: JwtPayload): Promise<string> {
    const env = getEnv(this.configService);
    const expiresIn = env.jwtRefreshExpiresIn as
      | `${number}s`
      | `${number}m`
      | `${number}h`
      | `${number}d`;

    return this.jwtService.signAsync(
      { ...payload, jti: randomUUID() },
      {
        secret: env.jwtRefreshSecret,
        expiresIn,
        algorithm: 'HS256',
      },
    );
  }

  getRefreshTokenExpiresAt(): Date {
    const env = getEnv(this.configService);
    return new Date(Date.now() + env.jwtRefreshExpiresInSeconds * 1000);
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    const env = getEnv(this.configService);

    try {
      const raw = await this.jwtService.verifyAsync<Record<string, unknown>>(
        token,
        {
          secret: env.jwtSecret,
          algorithms: ['HS256'],
        },
      );

      return this.normalizePayload(raw);
    } catch (error: unknown) {
      throw new UnauthorizedException({
        message: this.resolveAccessTokenMessage(error),
        code: this.resolveAccessTokenCode(error),
      });
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const env = getEnv(this.configService);

    try {
      const raw = await this.jwtService.verifyAsync<Record<string, unknown>>(
        token,
        {
          secret: env.jwtRefreshSecret,
          algorithms: ['HS256'],
        },
      );

      return this.normalizePayload(raw);
    } catch (error: unknown) {
      throw new UnauthorizedException({
        message: this.resolveRefreshTokenMessage(error),
        code: this.resolveRefreshTokenCode(error),
      });
    }
  }

  private normalizePayload(raw: Record<string, unknown>): JwtPayload {
    const sub = this.parsePositiveInt(raw.sub);
    const companyId = this.parsePositiveInt(raw.companyId);
    const email = raw.email;

    if (sub === null || companyId === null || typeof email !== 'string') {
      throw new UnauthorizedException({
        message: 'Invalid token payload',
        code: AuthErrorCode.ACCESS_TOKEN_INVALID,
      });
    }

    return { sub, companyId, email };
  }

  private parsePositiveInt(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      return value;
    }

    if (typeof value === 'string' && /^\d+$/.test(value)) {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    }

    return null;
  }

  private resolveAccessTokenMessage(error: unknown): string {
    if (hasErrorName(error) && error.name === 'TokenExpiredError') {
      return 'Access token expired';
    }

    return 'Invalid or expired access token';
  }

  private resolveAccessTokenCode(error: unknown): AuthErrorCode {
    if (hasErrorName(error) && error.name === 'TokenExpiredError') {
      return AuthErrorCode.ACCESS_TOKEN_EXPIRED;
    }

    return AuthErrorCode.ACCESS_TOKEN_INVALID;
  }

  private resolveRefreshTokenMessage(error: unknown): string {
    if (hasErrorName(error) && error.name === 'TokenExpiredError') {
      return 'Refresh token expired';
    }

    return 'Invalid refresh token';
  }

  private resolveRefreshTokenCode(error: unknown): AuthErrorCode {
    if (hasErrorName(error) && error.name === 'TokenExpiredError') {
      return AuthErrorCode.REFRESH_TOKEN_EXPIRED;
    }

    return AuthErrorCode.REFRESH_TOKEN_INVALID;
  }
}
