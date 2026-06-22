import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUserContext } from '../auth/auth.service';
import { RestAuthGuard } from '../auth/guards/rest-auth.guard';
import { CompanyQuestionImportService } from './company-question-import.service';
import type { CompanyQuestionImportPreviewPayload } from './types/company-question-import.type';

@Controller('api/company/question-bank/import')
export class CompanyQuestionImportController {
  constructor(
    private readonly importService: CompanyQuestionImportService,
  ) {}

  @Post('preview')
  @UseGuards(RestAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  previewImport(
    @CurrentUser() currentUser: AuthUserContext,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<CompanyQuestionImportPreviewPayload> {
    if (!file?.buffer?.length) {
      throw new BadRequestException({
        message: 'Missing import file',
        code: 'IMPORT_FILE_REQUIRED',
      });
    }

    return this.importService.previewFromBuffer(
      currentUser.companyId,
      file.buffer,
      file.originalname,
    );
  }
}
