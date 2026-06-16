import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AudioUploadFieldsDto } from './dto/audio-upload.dto';
import { AudioUploadService } from './services/audio-upload.service';
import { MediaStorageService } from '../media/media-storage.service';

@Controller('api/uploads')
export class AudioUploadController {
  constructor(
    private readonly audioUploadService: AudioUploadService,
    private readonly mediaStorageService: MediaStorageService,
  ) {}

  @Post('audio')
  @UseInterceptors(
    FileInterceptor('audioFile', {
      storage: memoryStorage(),
    }),
  )
  uploadAudio(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: AudioUploadFieldsDto,
  ) {
    return this.audioUploadService.uploadCandidateAudio(body, file);
  }
}
