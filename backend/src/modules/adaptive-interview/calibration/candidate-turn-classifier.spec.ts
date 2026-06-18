import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CandidateTurnClassifierGoldenDataset } from '../types/candidate-turn-classifier.types';
import { mapTurnKindToDisposition } from '../utils/map-turn-kind-to-disposition.util';
import {
  inferLegacyTurnKindShadow,
  legacyTurnKindMatchesExpected,
} from '../utils/legacy-turn-kind-shadow.util';

function loadGoldenDataset(): CandidateTurnClassifierGoldenDataset {
  const filePath = path.join(
    __dirname,
    'golden-cases',
    'candidate-turn-classifier.json',
  );
  return JSON.parse(
    fs.readFileSync(filePath, 'utf8'),
  ) as CandidateTurnClassifierGoldenDataset;
}

describe('candidate-turn-classifier golden dataset', () => {
  const dataset = loadGoldenDataset();

  it('has at least 30 cases', () => {
    expect(dataset.cases.length).toBeGreaterThanOrEqual(30);
  });

  it.each(dataset.cases.map((item) => [item.id, item]))(
    'maps disposition for %s',
    (_id, testCase) => {
      expect(
        mapTurnKindToDisposition(testCase.expected.turn_kind),
      ).toBe(testCase.expected.disposition);
    },
  );

  it('documents legacy regex divergences we are fixing', () => {
    const divergent = dataset.cases.filter((testCase) => {
      const legacy = inferLegacyTurnKindShadow({
        messageKind: testCase.input.message_kind,
        mainQuestionText: testCase.input.main_question_text,
        lastInterviewerMessage: testCase.input.last_interviewer_message,
        targetCheckpointTitle: testCase.input.target_checkpoint_title,
        targetCheckpointKey: testCase.input.target_checkpoint_key,
        localTurns: testCase.input.local_turns,
        candidateAnswer: testCase.input.candidate_answer,
      });

      return !legacyTurnKindMatchesExpected(
        legacy,
        testCase.expected.turn_kind,
      );
    });

    expect(divergent.length).toBeGreaterThanOrEqual(4);
    expect(divergent.map((item) => item.id)).toEqual(
      expect.arrayContaining(['substantive-partial-decline-other']),
    );
  });
});
