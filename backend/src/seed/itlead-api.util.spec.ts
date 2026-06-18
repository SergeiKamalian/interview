import {
  extractSlugFromItleadUrl,
  mapItleadDifficulty,
  slugToTopicCode,
} from './itlead-api.util';

describe('itlead-api.util', () => {
  it('extracts slug from ITLead page URL', () => {
    expect(
      extractSlugFromItleadUrl(
        'https://itlead.org/interview-questions/react/react-hydration-and-ssr',
      ),
    ).toBe('react-hydration-and-ssr');
  });

  it('maps ITLead SENIOR to bank level fields', () => {
    expect(mapItleadDifficulty('SENIOR')).toEqual({
      level: 'senior',
      difficulty: 'advanced',
      interviewWeight: 7,
    });
  });

  it('maps ITLead MIDDLE to bank level fields', () => {
    expect(mapItleadDifficulty('middle')).toEqual({
      level: 'middle',
      difficulty: 'intermediate',
      interviewWeight: 5,
    });
  });

  it('converts slug to topic code', () => {
    expect(slugToTopicCode('react-hydration-and-ssr')).toBe(
      'react_hydration_ssr',
    );
  });
});
