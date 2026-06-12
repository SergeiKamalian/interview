import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { AuthUserContext } from './auth.service';

type GraphqlContext = {
  currentUser?: AuthUserContext;
};

@Injectable()
export class AuthContextService {
  getCurrentUser(context: ExecutionContext): AuthUserContext | undefined {
    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext<GraphqlContext>().currentUser;
  }
}
