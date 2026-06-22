import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateCompanyTopicInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  code!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  skillId!: string;

  @Field(() => Float, { nullable: true, defaultValue: 5 })
  @IsOptional()
  @IsNumber()
  interviewWeight?: number;
}
