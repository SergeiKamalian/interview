import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(8)
  password!: string;

  @Field()
  @IsNotEmpty()
  fullName!: string;

  @Field()
  @IsNotEmpty()
  companyName!: string;
}
