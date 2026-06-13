import { describe, it, expect } from 'vitest';
import { getJournalAnalysisPrompt, getSystemPromptForCompanion } from './geminiPromptTemplates';

describe('Gemini Prompt Templates', () => {
  it('should generate a journal analysis prompt containing the student name and exam type', () => {
    const userName = 'Rohan';
    const examType = 'UPSC';
    const content = 'I am worried about history syllabus and test scores.';
    
    const prompt = getJournalAnalysisPrompt(userName, examType, content);
    
    expect(prompt).toContain(userName);
    expect(prompt).toContain(examType);
    expect(prompt).toContain(content);
    expect(prompt).toContain('stressScore');
    expect(prompt).toContain('emotions');
    expect(prompt).toContain('triggers');
    expect(prompt).toContain('distortions');
    expect(prompt).toContain('empatheticMessage');
    expect(prompt).toContain('copingTip');
  });

  it('should generate a companion system prompt with Aura counselor context', () => {
    const userName = 'Priya';
    const examType = 'NEET';
    
    const prompt = getSystemPromptForCompanion(userName, examType);
    
    expect(prompt).toContain('Aura');
    expect(prompt).toContain(userName);
    expect(prompt).toContain(examType);
    expect(prompt).toContain('empathetic');
    expect(prompt).toContain('coping');
  });
});
