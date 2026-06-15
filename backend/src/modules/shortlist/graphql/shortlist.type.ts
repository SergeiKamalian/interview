import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ShortlistStatusEnum {
  shortlisted = 'shortlisted',
  removed = 'removed',
}

registerEnumType(ShortlistStatusEnum, { name: 'ShortlistStatus' });

@ObjectType()
export class ShortlistActionPayloadType {
  @Field()
  candidateId!: string;

  @Field(() => ShortlistStatusEnum)
  status!: ShortlistStatusEnum;

  @Field(() => String, { nullable: true })
  reason?: string | null;
}
