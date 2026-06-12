import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService, type AuthUserContext } from '../auth.service';

type GraphqlContext = {
  req: { headers: { authorization?: string } };
  currentUser?: AuthUserContext;
};

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphqlContext>();
    const authorization = ctx.req.headers.authorization;

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
    ctx.currentUser = {
      id: payload.sub,
      email: payload.email,
      companyId: payload.companyId,
    };

    return true;
  }
}
