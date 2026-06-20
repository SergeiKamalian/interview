import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JobDescriptionDraftService } from './job-description-draft.service';
import { QuestionBankRepository } from './question-bank.repository';
import { QuestionBankResolver } from './question-bank.resolver';
import { QuestionBankService } from './question-bank.service';
import { QuestionSuggestionService } from './question-suggestion.service';

@Module({
  imports: [AuthModule],
  providers: [
    QuestionBankRepository,
    QuestionBankService,
    QuestionSuggestionService,
    JobDescriptionDraftService,
    QuestionBankResolver,
  ],
  exports: [QuestionBankService, QuestionBankRepository],
})
export class QuestionBankModule {}
