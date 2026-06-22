import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CompanyQuestionImportController } from './company-question-import.controller';
import { CompanyQuestionImportService } from './company-question-import.service';
import { CompanyQuestionPlaybookRepository } from './company-question-playbook.repository';
import { CompanyQuestionPlaybookService } from './company-question-playbook.service';
import { CompanyQuestionOverrideRepository } from './company-question-override.repository';
import { JobDescriptionDraftService } from './job-description-draft.service';
import { QuestionBankRepository } from './question-bank.repository';
import { QuestionBankResolver } from './question-bank.resolver';
import { QuestionBankService } from './question-bank.service';
import { QuestionSuggestionService } from './question-suggestion.service';

@Module({
  imports: [AuthModule],
  controllers: [CompanyQuestionImportController],
  providers: [
    CompanyQuestionOverrideRepository,
    CompanyQuestionImportService,
    CompanyQuestionPlaybookRepository,
    CompanyQuestionPlaybookService,
    QuestionBankRepository,
    QuestionBankService,
    QuestionSuggestionService,
    JobDescriptionDraftService,
    QuestionBankResolver,
  ],
  exports: [
    QuestionBankService,
    QuestionBankRepository,
    CompanyQuestionOverrideRepository,
    CompanyQuestionImportService,
  ],
})
export class QuestionBankModule {}
