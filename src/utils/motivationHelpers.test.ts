import { describe, it, expect } from 'vitest';
import { getExamMotivation } from './motivationHelpers';

describe('Motivation Helpers', () => {
  it('should return exam-specific motivation for JEE', () => {
    const quote = getExamMotivation('JEE');
    expect(quote).toContain('Physics');
    expect(quote).toContain('Math');
  });

  it('should return exam-specific motivation for NEET', () => {
    const quote = getExamMotivation('NEET');
    expect(quote).toContain('Biology');
    expect(quote).toContain('healing');
  });

  it('should return exam-specific motivation for UPSC', () => {
    const quote = getExamMotivation('UPSC');
    expect(quote).toContain('marathon');
    expect(quote).toContain('consistency');
  });

  it('should return exam-specific motivation for BOARD', () => {
    const quote = getExamMotivation('BOARD');
    expect(quote).toContain('Board exams');
    expect(quote).toContain('stepping stones');
  });

  it('should return default motivation for other/unknown exams', () => {
    const quote = getExamMotivation('OTHER');
    expect(quote).toContain('Consistency beats intensity');
  });
});
