export interface BreakTip {
  title: string;
  tip: string;
}

export const getMindfulnessBreakTip = (currentMode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'): BreakTip | null => {
  if (currentMode === 'SHORT_BREAK') {
    return {
      title: 'Short Break Recharge',
      tip: 'Instead of opening social media, look out the window, drink a glass of water, or stand up and rotate your neck. Keep your screen time zero during this break.',
    };
  }
  if (currentMode === 'LONG_BREAK') {
    return {
      title: 'Deep Rest Recovery',
      tip: 'Lie down flat, close your eyes, and listen to calming instrumental music, or step outside and walk around. Give your cognitive muscles a full cooling period.',
    };
  }
  return null;
};
