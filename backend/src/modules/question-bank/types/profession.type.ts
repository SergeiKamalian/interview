import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfessionType {
  @Field()
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;
}
