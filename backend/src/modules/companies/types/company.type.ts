import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CompanyType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field()
  isActive!: boolean;
}
