import { describe, it, expect } from 'vitest';
import { generateMockAnalysis, generateMockChatResponse } from './mockHelpers';

describe('Mock Helpers', () => {
  describe('generateMockAnalysis', () => {
    it('should generate a valid JournalAnalysis response structure', () => {
      const content = 'I feel totally fine and focused.';
      const result = generateMockAnalysis(content, 'Aman', 'JEE');

      expect(result).toHaveProperty('stressScore');
      expect(result).toHaveProperty('emotions');
      expect(result).toHaveProperty('triggers');
      expect(result).toHaveProperty('distortions');
      expect(result).toHaveProperty('empatheticMessage');
      expect(result).toHaveProperty('copingTip');

      expect(result.empatheticMessage).toContain('Aman');
      expect(result.empatheticMessage).toContain('JEE');
    });

    it('should identify specific emotions and triggers based on text context', () => {
      // test keyword triggers: 'fail' should trigger 'Self-Doubt'
      const contentWithFail = 'I am worried I might fail the exam.';
      const resultWithFail = generateMockAnalysis(contentWithFail, 'Aman', 'JEE');
      expect(resultWithFail.emotions).toContain('Self-Doubt');

      // 'mock test' should trigger Mock Test Scores
      const contentWithTest = 'My mock test scores are low.';
      const resultWithTest = generateMockAnalysis(contentWithTest, 'Aman', 'JEE');
      expect(resultWithTest.triggers).toContain('Mock Test Scores');

      // 'schedule' should trigger Time Management
      const contentWithTime = 'I cannot manage my study schedule.';
      const resultWithTime = generateMockAnalysis(contentWithTime, 'Aman', 'JEE');
      expect(resultWithTime.triggers).toContain('Time Management');

      // 'never' should trigger All-or-Nothing Thinking distortion
      const contentWithNever = 'I will never understand this topic.';
      const resultWithNever = generateMockAnalysis(contentWithNever, 'Aman', 'JEE');
      expect(resultWithNever.distortions.some(d => d.name === 'All-or-Nothing Thinking')).toBe(true);

      // 'ruin' should trigger Catastrophizing distortion
      const contentWithRuin = 'This mistake will ruin my life.';
      const resultWithRuin = generateMockAnalysis(contentWithRuin, 'Aman', 'JEE');
      expect(resultWithRuin.distortions.some(d => d.name === 'Catastrophizing')).toBe(true);
    });
  });

  describe('generateMockChatResponse', () => {
    it('should return a test-specific answer when test keywords are present', () => {
      const response = generateMockChatResponse('mock scores were bad', 'Aman', 'JEE');
      expect(response.toLowerCase()).toContain('mock');
      expect(response).toContain('practice');
    });

    it('should return a sleep/exhaustion-specific answer when tired keywords are present', () => {
      const response = generateMockChatResponse('I am so tired and exhausted', 'Aman', 'JEE');
      expect(response).toContain('Rest');
      expect(response).toContain('sleep');
    });

    it('should return a memory-specific answer when forget keywords are present', () => {
      const response = generateMockChatResponse('I forget everything I study', 'Aman', 'JEE');
      expect(response).toContain('anxiety');
      expect(response).toContain('calm your mind');
    });

    it('should return a default warm response for general chats', () => {
      const response = generateMockChatResponse('hello aura', 'Aman', 'JEE');
      expect(response).toContain('Aman');
      expect(response).toContain('JEE');
    });
  });
});
