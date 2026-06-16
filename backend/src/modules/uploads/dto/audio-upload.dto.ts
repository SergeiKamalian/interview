import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AudioUploadFieldsDto {
  @IsString()
  @IsNotEmpty()
  publicToken!: string;

  @IsString()
  @IsNotEmpty()
  attemptId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3600)
  durationSec?: number;
}

export type AudioUploadResponse = {
  mediaAssetId: string;
  storageKey: string;
  mimeType: string;
  fileSizeBytes: number;
  durationSec: number | null;
};
