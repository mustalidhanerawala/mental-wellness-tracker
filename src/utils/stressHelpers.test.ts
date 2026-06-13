import { describe, it, expect } from 'vitest';
import { getScoreColor, getStressSeverity } from './stressHelpers';

describe('Stress Helpers', () => {
  describe('getScoreColor', () => {
    it('should return success color for score < 4', () => {
      expect(getScoreColor(1)).toBe('var(--color-success)');
      expect(getScoreColor(3.5)).toBe('var(--color-success)');
    });

    it('should return secondary color for score between 4 and 6', () => {
      expect(getScoreColor(4)).toBe('var(--color-secondary)');
      expect(getScoreColor(6.9)).toBe('var(--color-secondary)');
    });

    it('should return warning-amber color for score between 7 and 8', () => {
      expect(getScoreColor(7)).toBe('var(--color-warning-amber)');
      expect(getScoreColor(8.5)).toBe('var(--color-warning-amber)');
    });

    it('should return warning color for score >= 9', () => {
      expect(getScoreColor(9)).toBe('var(--color-warning)');
      expect(getScoreColor(10)).toBe('var(--color-warning)');
    });
  });

  describe('getStressSeverity', () => {
    it('should handle score 0 (no data)', () => {
      const severity = getStressSeverity(0);
      expect(severity.label).toBe('No Data');
      expect(severity.color).toBe('var(--text-muted)');
    });

    it('should handle calm / low stress range', () => {
      const severity = getStressSeverity(2);
      expect(severity.label).toBe('Calm / Low');
      expect(severity.color).toBe('var(--color-success)');
    });

    it('should handle moderate stress range', () => {
      const severity = getStressSeverity(5.5);
      expect(severity.label).toBe('Moderate');
      expect(severity.color).toBe('var(--color-secondary)');
    });

    it('should handle high stress range', () => {
      const severity = getStressSeverity(8);
      expect(severity.label).toBe('High Stress');
      expect(severity.color).toBe('var(--color-warning-amber)');
    });

    it('should handle burnout risk range', () => {
      const severity = getStressSeverity(9.5);
      expect(severity.label).toBe('Burnout Risk');
      expect(severity.color).toBe('var(--color-warning)');
    });
  });
});
