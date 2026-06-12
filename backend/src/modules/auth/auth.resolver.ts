import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { getEnv } from '../../common/config/env.schema';
import { AuthService, type AuthUserContext } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { AuthPayload, MePayload } from './types/auth-payload.type';
import { LogoutPayload, RefreshPayload } from './types/refresh-payload.type';
import {
  clearRefreshTokenCookie,
  getCookieValue,
  setRefreshTokenCookie,
} from './utils/cookies';
import { REFRESH_TOKEN_COOKIE } from './constants';
import { extractRequestMeta } from './utils/request-meta.util';

type GqlContext = {
  req: Request;
  res: Response;
};

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Mutation(() => AuthPayload)
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: GqlContext,
  ): Promise<AuthPayload> {
    const result = await this.authService.register(
      input,
      extractRequestMeta(context.req),
    );

    this.setRefreshCookie(context.res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      tokenType: result.tokenType,
      user: result.user,
      company: result.company,
    };
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: GqlContext,
  ): Promise<AuthPayload> {
    const result = await this.authService.login(
      input,
      extractRequestMeta(context.req),
    );

    this.setRefreshCookie(context.res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      tokenType: result.tokenType,
      user: result.user,
      company: result.company,
    };
  }

  @Mutation(() => RefreshPayload)
  async refreshTokens(@Context() context: GqlContext): Promise<RefreshPayload> {
    const refreshToken = getCookieValue(context.req, REFRESH_TOKEN_COOKIE);
    const result = await this.authService.refresh(
      refreshToken ?? '',
      extractRequestMeta(context.req),
    );

    this.setRefreshCookie(context.res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      tokenType: result.tokenType,
    };
  }

  @Mutation(() => LogoutPayload)
  async logout(@Context() context: GqlContext): Promise<LogoutPayload> {
    const refreshToken = getCookieValue(context.req, REFRESH_TOKEN_COOKIE);
    await this.authService.logout(refreshToken);
    clearRefreshTokenCookie(context.res, this.isCookieSecure());

    return { success: true };
  }

  @Query(() => MePayload)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() currentUser: AuthUserContext): Promise<MePayload> {
    return this.authService.getMe(currentUser);
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    const env = getEnv(this.configService);

    setRefreshTokenCookie(response, refreshToken, {
      secure: this.isCookieSecure(),
      maxAgeMs: env.jwtRefreshExpiresInSeconds * 1000,
    });
  }

  private isCookieSecure(): boolean {
    return getEnv(this.configService).nodeEnv === 'production';
  }
}
