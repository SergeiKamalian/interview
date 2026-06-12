import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RefreshPayload {
  @Field()
  accessToken!: string;

  @Field()
  tokenType!: string;
}

@ObjectType()
export class LogoutPayload {
  @Field()
  success!: boolean;
}
