import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InterviewCoreRepository } from '../interview-core/interview-core.repository';
import { MediaAssetService } from '../media/media-asset.service';
import { MediaStorageService } from '../media/media-storage.service';
import { AudioUploadService } from './services/audio-upload.service';

describe('AudioUploadService', () => {
  let service: AudioUploadService;

  const interviewRepository = {
    findAttemptById: jest.fn(),
  };

  const mediaAssetService = {
    createAudioAsset: jest.fn(),
  };

  const mediaStorageService = {
    getAudioMaxBytes: jest.fn().mockReturnValue(10 * 1024 * 1024),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudioUploadService,
        {
          provide: InterviewCoreRepository,
          useValue: interviewRepository,
        },
        {
          provide: MediaAssetService,
          useValue: mediaAssetService,
        },
        {
          provide: MediaStorageService,
          useValue: mediaStorageService,
        },
      ],
    }).compile();

    service = module.get(AudioUploadService);
  });

  it('rejects unsupported mime type', async () => {
    interviewRepository.findAttemptById.mockResolvedValue({
      id: 1,
      companyId: 10,
      status: 'in_progress',
    });

    await expect(
      service.uploadCandidateAudio(
        {
          publicToken: 'token',
          attemptId: '1',
        },
        {
          buffer: Buffer.from('test'),
          mimetype: 'text/plain',
          size: 4,
          originalname: 'answer.txt',
        } as Express.Multer.File,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates media asset for valid upload', async () => {
    interviewRepository.findAttemptById.mockResolvedValue({
      id: 1,
      companyId: 10,
      status: 'in_progress',
    });
    mediaAssetService.createAudioAsset.mockResolvedValue({
      id: 55,
      storageKey: 'attempts/1/file.webm',
      mimeType: 'audio/webm',
      fileSizeBytes: 128,
      durationMs: 3000,
    });

    const result = await service.uploadCandidateAudio(
      {
        publicToken: 'token',
        attemptId: '1',
        durationSec: 3,
      },
      {
        buffer: Buffer.from('audio-bytes'),
        mimetype: 'audio/webm',
        size: 11,
        originalname: 'answer.webm',
      } as Express.Multer.File,
    );

    expect(result.mediaAssetId).toBe('55');
    expect(mediaAssetService.createAudioAsset).toHaveBeenCalled();
  });
});
