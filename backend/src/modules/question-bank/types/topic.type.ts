import { Field, Float, ObjectType } from '@nestjs/graphql';
import { SkillType } from './skill.type';

@ObjectType()
export class TopicType {
  @Field()
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field(() => Float)
  interviewWeight!: number;

  @Field(() => SkillType, { nullable: true })
  skill?: SkillType | null;
}
