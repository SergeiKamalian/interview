import { TalentPoolService } from './talent-pool.service';
import type { TalentPoolRepository } from '../repositories/talent-pool.repository';
import type {
  SourceInterviewSkillRow,
  TalentPoolRow,
} from '../repositories/talent-pool.repository';

function buildRow(overrides: Partial<TalentPoolRow> = {}): TalentPoolRow {
  return {
    candidate_id: 1,
    full_name: 'Ivan Petrov',
    email: 'ivan@example.com',
    achieved_level: 'middle',
    achieved_level_method: 'evidence',
    source_interview_id: 31,
    source_interview_title: 'Frontend interview',
    profession_id: 7,
    profession_name: 'Frontend Developer',
    matched_skill_count: 2,
    completed_at: new Date('2026-06-20T12:00:00Z'),
    ...overrides,
  } as TalentPoolRow;
}

function buildSkillRow(
  overrides: Partial<SourceInterviewSkillRow> = {},
): SourceInterviewSkillRow {
  return {
    interview_id: 31,
    skill_id: 100,
    skill_name: 'React',
    ...overrides,
  } as SourceInterviewSkillRow;
}

describe('TalentPoolService', () => {
  function createService(
    rows: TalentPoolRow[],
    skillRows: SourceInterviewSkillRow[] = [],
  ) {
    const findMatchingForLevel = jest.fn().mockResolvedValue(rows);
    const findSourceInterviewSkills = jest.fn().mockResolvedValue(skillRows);
    const repository = {
      findMatchingForLevel,
      findSourceInterviewSkills,
    } as unknown as TalentPoolRepository;
    return {
      service: new TalentPoolService(repository),
      findMatchingForLevel,
      findSourceInterviewSkills,
    };
  }

  it('forwards tenant company id, level, professionId and skillIds to the repository', async () => {
    const { service, findMatchingForLevel } = createService([]);

    await service.findMatchingForLevel(42, 'senior', 7, [100, 101]);

    expect(findMatchingForLevel).toHaveBeenCalledWith(
      42,
      'senior',
      7,
      [100, 101],
    );
  });

  it('skips the skill lookup when there are no matching candidates', async () => {
    const { service, findSourceInterviewSkills } = createService([]);

    const result = await service.findMatchingForLevel(42, 'senior', 7, []);

    expect(result).toEqual([]);
    expect(findSourceInterviewSkills).not.toHaveBeenCalled();
  });

  it('maps rows to GraphQL shape with epoch-seconds timestamp and profession', async () => {
    const { service } = createService(
      [buildRow()],
      [
        buildSkillRow({ skill_id: 100, skill_name: 'React' }),
        buildSkillRow({ skill_id: 101, skill_name: 'TypeScript' }),
        buildSkillRow({ skill_id: 200, skill_name: 'Node.js' }),
      ],
    );

    const result = await service.findMatchingForLevel(
      42,
      'middle',
      7,
      [100, 101],
    );

    expect(result).toEqual([
      {
        candidateId: '1',
        fullName: 'Ivan Petrov',
        email: 'ivan@example.com',
        achievedLevel: 'middle',
        achievedLevelMethod: 'evidence',
        sourceInterviewId: '31',
        sourceInterviewTitle: 'Frontend interview',
        professionId: '7',
        professionName: 'Frontend Developer',
        matchedSkills: ['React', 'TypeScript'],
        matchedSkillCount: 2,
        completedAt: Math.floor(
          new Date('2026-06-20T12:00:00Z').getTime() / 1000,
        ),
      },
    ]);
  });

  it('returns the full source stack as matchedSkills when no skillIds are requested', async () => {
    const { service } = createService(
      [buildRow({ matched_skill_count: 0 })],
      [
        buildSkillRow({ skill_id: 100, skill_name: 'React' }),
        buildSkillRow({ skill_id: 200, skill_name: 'Node.js' }),
      ],
    );

    const [candidate] = await service.findMatchingForLevel(42, 'middle', 7, []);

    expect(candidate.matchedSkills).toEqual(['React', 'Node.js']);
    expect(candidate.matchedSkillCount).toBe(0);
  });

  it('returns null method and completedAt when source columns are null', async () => {
    const { service } = createService([
      buildRow({ achieved_level_method: null, completed_at: null }),
    ]);

    const [candidate] = await service.findMatchingForLevel(42, 'junior', 7, []);

    expect(candidate.achievedLevelMethod).toBeNull();
    expect(candidate.completedAt).toBeNull();
  });
});
