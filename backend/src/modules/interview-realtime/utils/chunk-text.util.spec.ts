import { chunkTextForStream } from './chunk-text.util';

describe('chunkTextForStream', () => {
  it('splits text into bounded chunks', () => {
    expect(chunkTextForStream('abcdef', 2)).toEqual(['ab', 'cd', 'ef']);
  });

  it('returns empty array for blank text', () => {
    expect(chunkTextForStream('   ')).toEqual([]);
  });
});
