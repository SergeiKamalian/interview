import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

@InputType()
export class CheckpointInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  checkpointKey!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  expected!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  score!: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  sortOrder!: number;
}
