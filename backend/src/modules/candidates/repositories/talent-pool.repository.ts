import { Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../../common/database/database.service';
import type { DbQueryParam } from '../../../common/database/database.types';
import type { QuestionLevel } from '../../question-bank/types/question-level.enum';

export interface TalentPoolRow extends RowDataPacket {
  candidate_id: number;
  full_name: string;
  email: string;
  achieved_level: QuestionLevel;
  achieved_level_method: 'evidence' | 'estimate' | null;
  source_interview_id: number;
  source_interview_title: string;
  profession_id: number;
  profession_name: string;
  matched_skill_count: number;
  completed_at: Date | null;
}

export interface SourceInterviewSkillRow extends RowDataPacket {
  interview_id: number;
  skill_id: number;
  skill_name: string;
}

/**
 * Level ladder used for the `achieved_level >= :level` comparison and for the
 * "best attempt" tie-break. FIELD() returns the 1-based position of the value
 * in this ordered list, so a higher number means a higher demonstrated level.
 */
const LEVEL_LADDER_SQL = "'junior', 'middle', 'senior', 'lead'";

@Injectable()
export class TalentPoolRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Past candidates of `companyId` whose demonstrated (achieved) level is >= the
   * requested `level` AND whose source interview belongs to `professionId`.
   * Tenant-scoped on `final_evaluations.company_id`.
   *
   * Profession is a hard filter (`i.profession_id = ?`). Because the column is
   * NULLABLE, the INNER JOIN on `professions` plus the equality filter exclude
   * source interviews without a profession — they never match the pool.
   *
   * Skills are ranking-only: `matched_skill_count` counts how many of the
   * source interview's skills overlap the requested `skillIds` (0 when none are
   * passed). It never filters rows out, only re-orders them after the level.
   *
   * Dedup: one row per candidate email — best attempt ranked by highest
   * achieved_level, then most recent completed_at, then highest attempt id.
   * Since the query is already scoped to a single profession, the per-email
   * dedup correctly reflects "one candidate per stack" (the same email may
   * still surface separately for another profession in a different request).
   */
  async findMatchingForLevel(
    companyId: number,
    level: QuestionLevel,
    professionId: number,
    skillIds: number[] = [],
  ): Promise<TalentPoolRow[]> {
    const hasSkillFilter = skillIds.length > 0;
    const skillPlaceholders = skillIds.map(() => '?').join(', ');

    // Ranking-only overlap with the source interview's skills (reachable via
    // interview_questions.source_question_id -> question_skills -> skills).
    // NULL source_question_id rows simply do not join, so they count as 0.
    const matchedSkillCountSql = hasSkillFilter
      ? `(SELECT COUNT(DISTINCT qs.skill_id)
            FROM interview_questions iq
            INNER JOIN question_skills qs ON qs.question_id = iq.source_question_id
            WHERE iq.interview_id = ia.interview_id
              AND qs.skill_id IN (${skillPlaceholders}))`
      : '0';

    const params: DbQueryParam[] = [
      ...(hasSkillFilter ? skillIds : []),
      companyId,
      professionId,
      level,
    ];

    return this.database.query<TalentPoolRow[]>(
      `SELECT ranked.candidate_id,
              ranked.full_name,
              ranked.email,
              ranked.achieved_level,
              ranked.achieved_level_method,
              ranked.source_interview_id,
              ranked.source_interview_title,
              ranked.profession_id,
              ranked.profession_name,
              ranked.matched_skill_count,
              ranked.completed_at
       FROM (
         SELECT c.id AS candidate_id,
                c.full_name,
                c.email,
                fe.achieved_level,
                fe.achieved_level_method,
                ia.interview_id AS source_interview_id,
                i.title AS source_interview_title,
                i.profession_id,
                p.name AS profession_name,
                ${matchedSkillCountSql} AS matched_skill_count,
                ia.completed_at,
                ROW_NUMBER() OVER (
                  PARTITION BY c.email
                  ORDER BY FIELD(fe.achieved_level, ${LEVEL_LADDER_SQL}) DESC,
                           ia.completed_at DESC,
                           ia.id DESC
                ) AS rn
         FROM final_evaluations fe
         INNER JOIN interview_attempts ia ON ia.id = fe.interview_attempt_id
         INNER JOIN candidates c ON c.id = ia.candidate_id
         INNER JOIN interviews i ON i.id = ia.interview_id
         INNER JOIN professions p ON p.id = i.profession_id
         WHERE fe.company_id = ?
           AND ia.status = 'completed'
           AND ia.is_preview = 0
           AND fe.achieved_level IS NOT NULL
           AND i.profession_id = ?
           AND FIELD(fe.achieved_level, ${LEVEL_LADDER_SQL})
               >= FIELD(?, ${LEVEL_LADDER_SQL})
       ) ranked
       WHERE ranked.rn = 1
       ORDER BY FIELD(ranked.achieved_level, ${LEVEL_LADDER_SQL}) DESC,
                ranked.matched_skill_count DESC,
                ranked.completed_at DESC`,
      params,
    );
  }

  /**
   * Distinct skills attached to the questions of the given source interviews
   * (interview_questions.source_question_id -> question_skills -> skills). Used
   * to highlight a pooled candidate's stack. NULL source_question_id is skipped
   * by the INNER JOIN.
   */
  async findSourceInterviewSkills(
    interviewIds: number[],
  ): Promise<SourceInterviewSkillRow[]> {
    if (interviewIds.length === 0) {
      return [];
    }

    const placeholders = interviewIds.map(() => '?').join(', ');

    return this.database.query<SourceInterviewSkillRow[]>(
      `SELECT DISTINCT iq.interview_id AS interview_id,
              s.id AS skill_id,
              s.name AS skill_name
       FROM interview_questions iq
       INNER JOIN question_skills qs ON qs.question_id = iq.source_question_id
       INNER JOIN skills s ON s.id = qs.skill_id
       WHERE iq.interview_id IN (${placeholders})
       ORDER BY s.name ASC`,
      interviewIds,
    );
  }
}
