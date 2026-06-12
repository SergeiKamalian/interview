import { Field, ObjectType } from '@nestjs/graphql';
import { CompanyType } from '../../companies/types/company.type';
import { UserType } from '../../users/types/user.type';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken!: string;

  @Field()
  tokenType!: string;

  @Field(() => UserType)
  user!: UserType;

  @Field(() => CompanyType)
  company!: CompanyType;
}

@ObjectType()
export class MePayload {
  @Field(() => UserType)
  user!: UserType;

  @Field(() => CompanyType)
  company!: CompanyType;
}
