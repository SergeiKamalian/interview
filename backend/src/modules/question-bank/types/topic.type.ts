import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TopicType {
  @Field()
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;
}
