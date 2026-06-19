import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InterviewCoreModule } from '../interview-core/interview-core.module';
import { QuestionBankModule } from '../question-bank/question-bank.module';
import { InterviewTemplatesRepository } from './interview-templates.repository';
import { InterviewTemplatesResolver } from './interview-templates.resolver';
import { InterviewTemplatesService } from './interview-templates.service';

@Module({
  imports: [AuthModule, QuestionBankModule, InterviewCoreModule],
  providers: [
    InterviewTemplatesRepository,
    InterviewTemplatesService,
    InterviewTemplatesResolver,
  ],
  exports: [InterviewTemplatesRepository, InterviewTemplatesService],
})
export class InterviewTemplatesModule {}
