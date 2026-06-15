import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../common/redis/redis.service';
import { getAdaptiveAiConversationSessionTtlSeconds } from '../config/adaptive-interview-context.config';
import type {
  AdaptiveAiConversationMessage,
  AdaptiveAiConversationSession,
} from '../types/adaptive-ai-conversation.types';

export type AdaptiveAiConversationKind = 'evaluate';

@Injectable()
export class AdaptiveAiConversationService {
  constructor(private readonly redisService: RedisService) {}

  buildSessionKey(
    kind: AdaptiveAiConversationKind,
    attemptId: number,
    interviewQuestionId: number,
  ): string {
    return `adaptive-ai:${kind}:${attemptId}:${interviewQuestionId}`;
  }

  async loadSession(
    key: string,
    promptVersion: string,
  ): Promise<AdaptiveAiConversationSession | null> {
    const session = await this.redisService.getJson<AdaptiveAiConversationSession>(
      key,
    );

    if (!session || session.promptVersion !== promptVersion) {
      return null;
    }

    return session;
  }

  async saveSession(
    key: string,
    session: AdaptiveAiConversationSession,
  ): Promise<void> {
    await this.redisService.setJson(
      key,
      session,
      getAdaptiveAiConversationSessionTtlSeconds(),
    );
  }

  async clearQuestionSessions(
    attemptId: number,
    interviewQuestionId: number,
  ): Promise<void> {
    await this.redisService.del(
      this.buildSessionKey('evaluate', attemptId, interviewQuestionId),
    );
  }

  createBootstrapSession(input: {
    promptVersion: string;
    systemPrompt: string;
    bootstrapUserPrompt: string;
    bootstrapAssistantAck: string;
  }): AdaptiveAiConversationSession {
    return {
      promptVersion: input.promptVersion,
      turnCount: 0,
      messages: [
        { role: 'system', content: input.systemPrompt },
        { role: 'user', content: input.bootstrapUserPrompt },
        {
          role: 'assistant',
          content: input.bootstrapAssistantAck,
        },
      ],
    };
  }

  appendTurn(
    session: AdaptiveAiConversationSession,
    turnUserPrompt: string,
    assistantResponse: string,
  ): AdaptiveAiConversationSession {
    return {
      ...session,
      turnCount: session.turnCount + 1,
      messages: [
        ...session.messages,
        { role: 'user', content: turnUserPrompt },
        { role: 'assistant', content: assistantResponse },
      ],
    };
  }

  buildCompletionMessages(
    session: AdaptiveAiConversationSession,
    turnUserPrompt: string,
  ): AdaptiveAiConversationMessage[] {
    return [
      ...session.messages,
      { role: 'user', content: turnUserPrompt },
    ];
  }
}
