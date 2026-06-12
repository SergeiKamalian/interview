import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { AuthUserContext } from '../auth.service';

type GraphqlContext = {
  req: { headers: { authorization?: string } };
  currentUser?: AuthUserContext;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUserContext => {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphqlContext>();
    const currentUser = ctx.currentUser;

    if (!currentUser) {
      throw new Error('Current user is missing in GraphQL context');
    }

    return currentUser;
  },
);
