import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../common/redis/redis.service';

export type ConductDecision = 'none' | 'warn' | 'terminate';

const CONDUCT_WARNING_KEY_PREFIX = 'conduct:warnings';
const CONDUCT_WARN_TTL_SECONDS = 60 * 60 * 24; // 24 hours — covers any realistic interview session

/**
 * Patterns covering common Russian-language profanity and direct personal insults.
 * Uses word-boundary anchors where applicable to reduce false positives.
 * The list is intentionally limited to high-confidence cases.
 */
const ABUSIVE_PATTERNS: RegExp[] = [
  /\bнахуй\b/i,
  /\bпохуй\b/i,
  /\bзахуй\b/i,
  /\bхуйн/i,
  /\bхуй\b/i,
  /\bпизд/i,
  /\bеба(л|ть|ной|на)\b/i,
  /\bъеб/i,
  /\bбля(дь|дская|дской)\b/i,
  /\bблядь\b/i,
  /\bсука\s+блять\b/i,
  /\bиди\s+(нахуй|в\s+жопу|на\s+хуй)\b/i,
  /\bпошёл\s+(нахуй|на\s+хуй)\b/i,
  /\bпошел\s+(нахуй|на\s+хуй)\b/i,
  /\bушёл\s+нахуй\b/i,
  /\bзасунь\b/i,
  /\bёбаный\b/i,
  /\bебаный\b/i,
  /\bмудак\b/i,
  /\bпедик\b/i,
  /\bcock\b/i,
  /\bfuck\s*(you|off|this)\b/i,
  /\bfuck\b/i,
  /\bshit\b/i,
  /\bcunt\b/i,
  /\bbastard\b/i,
  /\basshole\b/i,
];

export type ConductWarningRecord = {
  count: number;
};

@Injectable()
export class CandidateConductGuardService {
  constructor(private readonly redis: RedisService) {}

  private buildKey(attemptId: number): string {
    return `${CONDUCT_WARNING_KEY_PREFIX}:${attemptId}`;
  }

  /**
   * Returns true if the text contains content that violates conduct rules.
   */
  isAbusive(text: string): boolean {
    const normalized = text.toLowerCase();
    return ABUSIVE_PATTERNS.some((pattern) => pattern.test(normalized));
  }

  private async getWarningCount(attemptId: number): Promise<number> {
    const record = await this.redis.getJson<ConductWarningRecord>(
      this.buildKey(attemptId),
    );
    return record?.count ?? 0;
  }

  private async setWarningCount(
    attemptId: number,
    count: number,
  ): Promise<void> {
    await this.redis.setJson(
      this.buildKey(attemptId),
      { count } satisfies ConductWarningRecord,
      CONDUCT_WARN_TTL_SECONDS,
    );
  }

  /**
   * Checks the candidate's message for abusive content.
   * If abusive, increments the warning counter and returns:
   * - `'warn'`      — first violation, issue a warning
   * - `'terminate'` — repeated violation, end the interview
   * - `'none'`      — no issue detected
   */
  async checkAndDecide(
    attemptId: number,
    text: string,
  ): Promise<ConductDecision> {
    if (!this.isAbusive(text)) {
      return 'none';
    }

    const currentCount = await this.getWarningCount(attemptId);
    await this.setWarningCount(attemptId, currentCount + 1);

    if (currentCount === 0) {
      return 'warn';
    }

    return 'terminate';
  }

  /** Clears the warning counter (e.g. on attempt completion). */
  async clearWarnings(attemptId: number): Promise<void> {
    await this.redis.del(this.buildKey(attemptId));
  }
}
