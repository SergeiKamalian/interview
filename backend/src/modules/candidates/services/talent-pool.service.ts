import { Injectable } from '@nestjs/common';
import type { QuestionLevel } from '../../question-bank/types/question-level.enum';
import type { QuestionLevelEnum } from '../../question-bank/types/question.type';
import { AchievedLevelMethodEnum } from '../../ai-evaluation/graphql/final-evaluation.type';
import type { TalentPoolCandidateType } from '../graphql/talent-pool.type';
import { TalentPoolRepository } from '../repositories/talent-pool.repository';

@Injectable()
export class TalentPoolService {
  constructor(private readonly repository: TalentPoolRepository) {}

  /**
   * Talent pool for a target `level` within a single `professionId` (hard
   * filter). `skillIds` are optional and only used to rank/highlight matched
   * skills — they never narrow the result set.
   */
  async findMatchingForLevel(
    companyId: number,
    level: QuestionLevel,
    professionId: number,
    skillIds: number[] = [],
  ): Promise<TalentPoolCandidateType[]> {
    const rows = await this.repository.findMatchingForLevel(
      companyId,
      level,
      professionId,
      skillIds,
    );

    if (rows.length === 0) {
      return [];
    }

    const interviewIds = [
      ...new Set(rows.map((row) => row.source_interview_id)),
    ];
    const skillRows =
      await this.repository.findSourceInterviewSkills(interviewIds);

    // interviewId -> ordered list of { id, name } for its source stack.
    const skillsByInterview = new Map<number, { id: number; name: string }[]>();
    for (const skillRow of skillRows) {
      const list = skillsByInterview.get(skillRow.interview_id) ?? [];
      list.push({ id: skillRow.skill_id, name: skillRow.skill_name });
      skillsByInterview.set(skillRow.interview_id, list);
    }

    const requestedSkillIds = new Set(skillIds);
    const hasSkillFilter = requestedSkillIds.size > 0;

    return rows.map((row) => {
      const sourceSkills = skillsByInterview.get(row.source_interview_id) ?? [];
      // With requested skills -> only the overlapping ones (matches
      // matched_skill_count). Without -> show the full source stack so the UI
      // can still surface the candidate's profile.
      const matchedSkills = (
        hasSkillFilter
          ? sourceSkills.filter((skill) => requestedSkillIds.has(skill.id))
          : sourceSkills
      ).map((skill) => skill.name);

      return {
        candidateId: String(row.candidate_id),
        fullName: row.full_name,
        email: row.email,
        achievedLevel: row.achieved_level as unknown as QuestionLevelEnum,
        achievedLevelMethod: row.achieved_level_method
          ? (row.achieved_level_method as AchievedLevelMethodEnum)
          : null,
        sourceInterviewId: String(row.source_interview_id),
        sourceInterviewTitle: row.source_interview_title,
        professionId: String(row.profession_id),
        professionName: row.profession_name,
        matchedSkills,
        matchedSkillCount: Number(row.matched_skill_count),
        completedAt: row.completed_at
          ? Math.floor(row.completed_at.getTime() / 1000)
          : null,
      };
    });
  }
}
