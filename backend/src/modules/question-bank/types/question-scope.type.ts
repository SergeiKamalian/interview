import { registerEnumType } from '@nestjs/graphql';
import { QUESTION_SCOPES } from './question-scope.enum';

export enum QuestionScopeEnum {
  global = 'global',
  company = 'company',
  all = 'all',
}

registerEnumType(QuestionScopeEnum, { name: 'QuestionScope' });

export const GRAPHQL_QUESTION_SCOPES = QUESTION_SCOPES;
