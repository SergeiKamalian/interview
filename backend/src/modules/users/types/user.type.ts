import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field()
  fullName!: string;

  @Field()
  isActive!: boolean;
}
