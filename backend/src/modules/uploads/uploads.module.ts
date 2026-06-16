import { Module } from '@nestjs/common';
import { InterviewCoreModule } from '../interview-core/interview-core.module';
import { MediaModule } from '../media/media.module';
import { MediaFilesController } from '../media/media-files.controller';
import { AudioUploadController } from './audio-upload.controller';
import { AudioUploadService } from './services/audio-upload.service';

@Module({
  imports: [InterviewCoreModule, MediaModule],
  controllers: [AudioUploadController, MediaFilesController],
  providers: [AudioUploadService],
})
export class UploadsModule {}
