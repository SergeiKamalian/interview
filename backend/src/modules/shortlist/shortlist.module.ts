import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ShortlistResolver } from './graphql/shortlist.resolver';
import { ShortlistRepository } from './repositories/shortlist.repository';
import { ShortlistService } from './services/shortlist.service';

@Module({
  imports: [AuthModule],
  providers: [ShortlistRepository, ShortlistService, ShortlistResolver],
  exports: [ShortlistRepository, ShortlistService],
})
export class ShortlistModule {}
