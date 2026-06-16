import { Module } from '@nestjs/common';
import { MediaAssetRepository } from './media-asset.repository';
import { MediaAssetService } from './media-asset.service';
import { MediaStorageService } from './media-storage.service';

@Module({
  providers: [MediaAssetRepository, MediaStorageService, MediaAssetService],
  exports: [MediaAssetService, MediaAssetRepository, MediaStorageService],
})
export class MediaModule {}
