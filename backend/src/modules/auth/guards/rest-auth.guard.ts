import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type AuthUserContext } from '../auth.service';

export type AuthenticatedRequest = Request & {
  currentUser?: AuthUserContext;
};

@Injectable()
export class RestAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const payload = await this.authService.verifyAccessToken(token);
    request.currentUser = {
      id: payload.sub,
      email: payload.email,
      companyId: payload.companyId,
    };

    return true;
  }
}
