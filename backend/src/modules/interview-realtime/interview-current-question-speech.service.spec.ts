import { Test, TestingModule } from '@nestjs/testing';
import { InterviewCoreRepository } from '../interview-core/interview-core.repository';
import { InterviewAiAudioStreamService } from './interview-ai-audio-stream.service';
import { InterviewCurrentQuestionSpeechService } from './interview-current-question-speech.service';

describe('InterviewCurrentQuestionSpeechService', () => {
  let service: InterviewCurrentQuestionSpeechService;

  const interviewRepository = {
    findAttemptById: jest.fn(),
    listQuestionsForInterview: jest.fn(),
    listMessages: jest.fn(),
    countMainAnswerMessages: jest.fn(),
    countCandidateMessages: jest.fn(),
  };

  const aiAudioStreamService = {
    isEnabled: jest.fn().mockReturnValue(true),
    streamAudioForText: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.ADAPTIVE_INTERVIEW_ENABLED = 'true';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewCurrentQuestionSpeechService,
        {
          provide: InterviewCoreRepository,
          useValue: interviewRepository,
        },
        {
          provide: InterviewAiAudioStreamService,
          useValue: aiAudioStreamService,
        },
      ],
    }).compile();

    service = module.get(InterviewCurrentQuestionSpeechService);
  });

  afterEach(() => {
    delete process.env.ADAPTIVE_INTERVIEW_ENABLED;
  });

  it('speaks the current AI question on join', async () => {
    interviewRepository.findAttemptById.mockResolvedValue({
      id: 7,
      interviewId: 3,
      status: 'in_progress',
    });
    interviewRepository.listQuestionsForInterview.mockResolvedValue([
      {
        id: 11,
        questionText: 'Для чего нужны generics в TypeScript и как их использовать?',
      },
    ]);
    interviewRepository.listMessages.mockResolvedValue([
      {
        id: 100,
        role: 'ai',
        content:
          'Для чего нужны generics in TypeScript и как их использовать?',
        interviewQuestionId: 11,
        messageKind: 'main_question',
      },
    ]);
    interviewRepository.countMainAnswerMessages.mockResolvedValue(0);

    await service.speakCurrentQuestion({
      attemptId: 7,
      publicToken: 'token',
    });

    expect(aiAudioStreamService.streamAudioForText).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptId: 7,
        interviewQuestionId: 11,
        messageKind: 'main_question',
        text: expect.stringContaining('generics'),
      }),
    );
  });
});
