import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class AiCostFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  model?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  provider?: string;
}
