import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isAdaptiveInterviewEnabled } from '../adaptive-interview/config/adaptive-interview-context.config';
import { resolveSessionProgress } from '../adaptive-interview/services/adaptive-interview-submit.service';
import { InterviewCoreRepository } from '../interview-core/interview-core.repository';
import { resolveWelcomeMessage } from '../interview-core/utils/interview-welcome.util';
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

  async speakOnJoin(input: {
    attemptId: number;
    publicToken: string;
  }): Promise<void> {
    const spokeWelcome = await this.speakWelcomeIfPending(input);
    if (spokeWelcome) {
      return;
    }

    await this.speakCurrentQuestion(input);
  }

  async speakWelcomeIfPending(input: {
    attemptId: number;
    publicToken: string;
    force?: boolean;
  }): Promise<boolean> {
    if (!this.aiAudioStreamService.isEnabled()) {
      return false;
    }

    const attempt = await this.interviewRepository.findAttemptById(
      input.attemptId,
      input.publicToken.trim(),
    );

    if (!attempt || attempt.status !== 'pending') {
      return false;
    }

    const [interview, candidate, questions] = await Promise.all([
      this.interviewRepository.findInterviewByAttemptId(
        input.attemptId,
        input.publicToken.trim(),
      ),
      this.interviewRepository.findCandidateByAttemptId(input.attemptId),
      this.interviewRepository.listQuestionsForInterview(attempt.interviewId),
    ]);

    if (!interview || !candidate) {
      return false;
    }

    const welcomeText = resolveWelcomeMessage({
      template: interview.welcomeMessageTemplate,
      interviewerName: interview.interviewerName,
      candidateName: candidate.fullName,
      jobRole: interview.jobRole,
      title: interview.title,
      questionCount: questions.length,
    });

    const dedupKey = `${input.attemptId}:welcome`;
    if (!input.force && this.spokenMessageKeys.has(dedupKey)) {
      return true;
    }

    if (this.inFlightSpeechKeys.has(dedupKey)) {
      return true;
    }

    this.inFlightSpeechKeys.add(dedupKey);
    this.spokenMessageKeys.add(dedupKey);

    try {
      this.logger.log(`Speaking welcome attempt=${input.attemptId}`);
      this.aiAudioStreamService.streamAudioForText({
        attemptId: input.attemptId,
        interviewQuestionId: null,
        messageKind: 'welcome',
        streamId: randomUUID(),
        text: welcomeText,
      });
      return true;
    } finally {
      this.inFlightSpeechKeys.delete(dedupKey);
    }
  }

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
