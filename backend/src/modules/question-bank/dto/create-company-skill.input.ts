import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateCompanySkillInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}
