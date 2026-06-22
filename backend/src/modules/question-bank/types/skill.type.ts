import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SkillType {
  @Field()
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field()
  isCustom!: boolean;
}
