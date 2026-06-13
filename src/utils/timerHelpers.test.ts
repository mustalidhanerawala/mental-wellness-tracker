import { describe, it, expect } from 'vitest';
import { getMindfulnessBreakTip } from './timerHelpers';

describe('Timer Helpers', () => {
  it('should return short break tips for SHORT_BREAK mode', () => {
    const tip = getMindfulnessBreakTip('SHORT_BREAK');
    expect(tip).not.toBeNull();
    expect(tip?.title).toBe('Short Break Recharge');
    expect(tip?.tip).toContain('look out the window');
  });

  it('should return long break tips for LONG_BREAK mode', () => {
    const tip = getMindfulnessBreakTip('LONG_BREAK');
    expect(tip).not.toBeNull();
    expect(tip?.title).toBe('Deep Rest Recovery');
    expect(tip?.tip).toContain('calming instrumental music');
  });

  it('should return null for FOCUS mode', () => {
    const tip = getMindfulnessBreakTip('FOCUS');
    expect(tip).toBeNull();
  });
});
