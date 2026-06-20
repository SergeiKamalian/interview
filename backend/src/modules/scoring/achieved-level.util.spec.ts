import {
  computeAchievedLevel,
  readAchievedLevelPassRatio,
  type AchievedLevelInput,
} from './achieved-level.util';

function q(level: string, score: number, maxScore: number): AchievedLevelInput {
  return { level, score, maxScore };
}

describe('computeAchievedLevel', () => {
  it('returns null/estimate for empty input', () => {
    const result = computeAchievedLevel([]);
    expect(result.achievedLevel).toBeNull();
    expect(result.method).toBe('estimate');
    expect(result.perLevel).toHaveLength(0);
    expect(result.note).toMatch(/no scored questions/i);
  });

  it('lead interview: passes middle, fails senior+lead → demonstrated middle (evidence)', () => {
    const result = computeAchievedLevel([
      q('middle', 9, 10),
      q('middle', 8, 10),
      q('senior', 4, 10),
      q('lead', 2, 10),
    ]);

    expect(result.achievedLevel).toBe('middle');
    expect(result.method).toBe('evidence');
    expect(result.estimatedLevel).toBeNull();
    expect(result.perLevel.map((item) => item.level)).toEqual([
      'middle',
      'senior',
      'lead',
    ]);
    expect(result.perLevel.find((i) => i.level === 'middle')?.passed).toBe(true);
    expect(result.perLevel.find((i) => i.level === 'senior')?.passed).toBe(
      false,
    );
  });

  it('single-level lead interview, passed → demonstrated lead (evidence)', () => {
    const result = computeAchievedLevel([
      q('lead', 8, 10),
      q('lead', 7, 10),
    ]);

    expect(result.achievedLevel).toBe('lead');
    expect(result.method).toBe('evidence');
  });

  it('single-level lead interview, failed → null + estimate one level below', () => {
    const result = computeAchievedLevel([
      q('lead', 3, 10),
      q('lead', 4, 10),
    ]);

    expect(result.achievedLevel).toBeNull();
    expect(result.method).toBe('estimate');
    expect(result.estimatedLevel).toBe('senior');
    expect(result.note).toMatch(/calibration/i);
  });

  it('walks the full ladder when all levels pass → highest (senior)', () => {
    const result = computeAchievedLevel([
      q('junior', 10, 10),
      q('middle', 9, 10),
      q('senior', 8, 10),
    ]);

    expect(result.achievedLevel).toBe('senior');
    expect(result.method).toBe('evidence');
  });

  it('is contiguous: junior pass, middle fail, senior pass → stops at junior', () => {
    const result = computeAchievedLevel([
      q('junior', 10, 10),
      q('middle', 3, 10),
      q('senior', 9, 10),
    ]);

    expect(result.achievedLevel).toBe('junior');
    expect(result.method).toBe('evidence');
  });

  it('multi-level where lowest present level fails → null + estimate', () => {
    const result = computeAchievedLevel([
      q('middle', 3, 10),
      q('lead', 2, 10),
    ]);

    expect(result.achievedLevel).toBeNull();
    expect(result.method).toBe('estimate');
    expect(result.estimatedLevel).toBe('junior');
  });

  it('respects a custom pass ratio', () => {
    const strict = computeAchievedLevel([q('lead', 7, 10)], 0.8);
    expect(strict.achievedLevel).toBeNull();

    const lenient = computeAchievedLevel([q('lead', 7, 10)], 0.6);
    expect(lenient.achievedLevel).toBe('lead');
  });

  it('ignores questions with unknown level or non-positive max score', () => {
    const result = computeAchievedLevel([
      q('middle', 9, 10),
      q('principal', 0, 10),
      q('lead', 5, 0),
    ]);

    expect(result.perLevel.map((item) => item.level)).toEqual(['middle']);
    expect(result.achievedLevel).toBe('middle');
  });
});

describe('readAchievedLevelPassRatio', () => {
  it('defaults to 0.65 when unset or invalid', () => {
    expect(readAchievedLevelPassRatio({} as NodeJS.ProcessEnv)).toBe(0.65);
    expect(
      readAchievedLevelPassRatio({
        ACHIEVED_LEVEL_PASS_RATIO: 'nope',
      } as unknown as NodeJS.ProcessEnv),
    ).toBe(0.65);
    expect(
      readAchievedLevelPassRatio({
        ACHIEVED_LEVEL_PASS_RATIO: '1.5',
      } as unknown as NodeJS.ProcessEnv),
    ).toBe(0.65);
  });

  it('reads a valid ratio from env', () => {
    expect(
      readAchievedLevelPassRatio({
        ACHIEVED_LEVEL_PASS_RATIO: '0.7',
      } as unknown as NodeJS.ProcessEnv),
    ).toBe(0.7);
  });
});
