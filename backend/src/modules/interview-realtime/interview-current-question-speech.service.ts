import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isAdaptiveInterviewEnabled } from '../adaptive-interview/config/adaptive-interview-context.config';
import { resolveSessionProgress } from '../adaptive-interview/services/adaptive-interview-submit.service';
import { InterviewCoreRepository } from '../interview-core/interview-core.repository';
import { InterviewAiAudioStreamService } from './interview-ai-audio-stream.service';

@Injectable()
export class InterviewCurrentQuestionSpeechService {
  private readonly logger = new Logger(InterviewCurrentQuestionSpeechService.name);
  private readonly spokenMessageKeys = new Set<string>();
  private readonly inFlightSpeechKeys = new Set<string>();

  constructor(
    private readonly interviewRepository: InterviewCoreRepository,
    private readonly aiAudioStreamService: InterviewAiAudioStreamService,
  ) {}

  async speakCurrentQuestion(input: {
    attemptId: number;
    publicToken: string;
    force?: boolean;
  }): Promise<void> {
    if (!this.aiAudioStreamService.isEnabled()) {
      return;
    }

    const attempt = await this.interviewRepository.findAttemptById(
      input.attemptId,
      input.publicToken.trim(),
    );

    if (!attempt || attempt.status !== 'in_progress') {
      return;
    }

    const adaptiveEnabled = isAdaptiveInterviewEnabled();
    const [questions, messages, answeredMainQuestions] = await Promise.all([
      this.interviewRepository.listQuestionsForInterview(attempt.interviewId),
      this.interviewRepository.listMessages(input.attemptId),
      adaptiveEnabled
        ? this.interviewRepository.countMainAnswerMessages(input.attemptId)
        : this.interviewRepository.countCandidateMessages(input.attemptId),
    ]);

    const progress = resolveSessionProgress({
      messages,
      questions,
      answeredMainQuestions,
      adaptiveEnabled,
    });

    const questionText = progress.currentQuestionText?.trim();
    const interviewQuestionId = progress.currentQuestionId;

    if (!questionText || !interviewQuestionId) {
      return;
    }

    const lastAiMessage = [...messages].reverse().find(
      (message) => message.role === 'ai',
    );
    const dedupKey = lastAiMessage
      ? `${input.attemptId}:${lastAiMessage.id}`
      : `${input.attemptId}:question:${interviewQuestionId}`;

    if (!input.force && this.spokenMessageKeys.has(dedupKey)) {
      return;
    }

    if (this.inFlightSpeechKeys.has(dedupKey)) {
      return;
    }

    this.inFlightSpeechKeys.add(dedupKey);
    this.spokenMessageKeys.add(dedupKey);

    try {
      this.logger.log(
        `Speaking current question attempt=${input.attemptId} question=${interviewQuestionId}`,
      );

      this.aiAudioStreamService.streamAudioForText({
        attemptId: input.attemptId,
        interviewQuestionId,
        messageKind: lastAiMessage?.messageKind ?? 'main_question',
        streamId: randomUUID(),
        text: questionText,
      });
    } finally {
      this.inFlightSpeechKeys.delete(dedupKey);
    }
  }
}
