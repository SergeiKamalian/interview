import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuestionBankRepository } from './question-bank.repository';
import { QuestionBankResolver } from './question-bank.resolver';
import { QuestionBankService } from './question-bank.service';

@Module({
  imports: [AuthModule],
  providers: [
    QuestionBankRepository,
    QuestionBankService,
    QuestionBankResolver,
  ],
  exports: [QuestionBankService, QuestionBankRepository],
})
export class QuestionBankModule {}
