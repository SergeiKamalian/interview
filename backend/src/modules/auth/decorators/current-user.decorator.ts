import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { AuthenticatedRequest } from '../guards/rest-auth.guard';
import type { AuthUserContext } from '../auth.service';

type GraphqlContext = {
  req: { headers: { authorization?: string } };
  currentUser?: AuthUserContext;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUserContext => {
    if (context.getType<'graphql' | 'http'>() === 'http') {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      const currentUser = request.currentUser;

      if (!currentUser) {
        throw new Error('Current user is missing in HTTP context');
      }

      return currentUser;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphqlContext>();
    const currentUser = ctx.currentUser;

    if (!currentUser) {
      throw new Error('Current user is missing in GraphQL context');
    }

    return currentUser;
  },
);
