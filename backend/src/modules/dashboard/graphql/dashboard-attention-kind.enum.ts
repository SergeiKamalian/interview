import { registerEnumType } from '@nestjs/graphql';

export enum DashboardAttentionKindEnum {
  needs_review = 'needs_review',
  strong_candidate = 'strong_candidate',
  abandoned = 'abandoned',
  in_progress = 'in_progress',
}

registerEnumType(DashboardAttentionKindEnum, { name: 'DashboardAttentionKind' });
