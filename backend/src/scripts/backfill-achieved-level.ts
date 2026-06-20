import { Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppConfigModule } from '../common/config/config.module';
import { DatabaseModule } from '../common/database/database.module';
import { RedisModule } from '../common/redis/redis.module';
import { AiProviderModule } from '../modules/ai-provider/ai-provider.module';
import { AiEvaluationModule } from '../modules/ai-evaluation/ai-evaluation.module';
import { FinalEvaluationRepository } from '../modules/ai-evaluation/repositories/final-evaluation.repository';
import { FinalEvaluationService } from '../modules/ai-evaluation/services/final-evaluation.service';
import { computeAchievedLevel } from '../modules/scoring/achieved-level.util';

/**
 * Minimal root module for the standalone backfill: pulls in only what
 * FinalEvaluationService needs (DB, Redis, AI provider config) and avoids the
 * HTTP/GraphQL layer of AppModule.
 */
@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    RedisModule,
    AiProviderModule,
    AiEvaluationModule,
  ],
})
class BackfillAchievedLevelModule {}

/**
 * TASK-18.9 — Deterministic backfill of final_evaluations.achieved_level on
 * attempts that were evaluated before migration 023 (achieved_level IS NULL).
 *
 * It recomputes the demonstrated level from the SAME per-question scoreInputs the
 * live FinalEvaluationService uses (interview_question_summaries → fallback
 * question_evaluations), via the pure computeAchievedLevel() — NO LLM is called.
 *
 * Idempotent: only rows with both achieved_level and achieved_level_method NULL
 * are touched, so a second run is a no-op.
 */
async function main(): Promise<void> {
  const logger = new Logger('BackfillAchievedLevel');

  const app = await NestFactory.createApplicationContext(
    BackfillAchievedLevelModule,
    { logger: ['error', 'warn', 'log'] },
  );

  try {
    const finalEvaluationService = app.get(FinalEvaluationService);
    const finalEvaluationRepository = app.get(FinalEvaluationRepository);

    const candidates =
      await finalEvaluationRepository.findAchievedLevelBackfillCandidates();

    logger.log(
      `Candidates for backfill (achieved_level IS NULL): ${candidates.length}`,
    );

    let updatedWithLevel = 0;
    let updatedEstimateNull = 0;
    let skippedNoData = 0;
    let alreadyDone = 0;

    for (const candidate of candidates) {
      const scoreInputs = await finalEvaluationService.collectScoreInputs(
        candidate.companyId,
        candidate.interviewAttemptId,
        candidate.interviewId,
      );

      if (scoreInputs === null) {
        skippedNoData += 1;
        logger.warn(
          `Skipped fe#${candidate.finalEvaluationId} (attempt ${candidate.interviewAttemptId}): no per-question data`,
        );
        continue;
      }

      const result = computeAchievedLevel(scoreInputs);

      const affected = await finalEvaluationRepository.backfillAchievedLevel({
        finalEvaluationId: candidate.finalEvaluationId,
        achievedLevel: result.achievedLevel,
        achievedLevelMethod: result.method,
      });

      if (affected === 0) {
        alreadyDone += 1;
        continue;
      }

      if (result.achievedLevel !== null) {
        updatedWithLevel += 1;
      } else {
        updatedEstimateNull += 1;
      }

      logger.log(
        `fe#${candidate.finalEvaluationId} (attempt ${candidate.interviewAttemptId}): ` +
          `achievedLevel=${result.achievedLevel ?? 'null'} method=${result.method}`,
      );
    }

    logger.log('--- Backfill summary ---');
    logger.log(`Total candidates:       ${candidates.length}`);
    logger.log(`Updated (with level):   ${updatedWithLevel}`);
    logger.log(`Updated (estimate/null):${updatedEstimateNull}`);
    logger.log(`Skipped (no data):      ${skippedNoData}`);
    logger.log(`Already done (no-op):   ${alreadyDone}`);
  } finally {
    await app.close();
  }
}

void main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const reason =
      error instanceof Error ? (error.stack ?? error.message) : String(error);

    console.error(`Backfill failed: ${reason}`);
    process.exit(1);
  });
