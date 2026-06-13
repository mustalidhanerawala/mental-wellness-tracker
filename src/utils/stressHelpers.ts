export const getScoreColor = (score: number): string => {
  if (score < 4) return 'var(--color-success)';
  if (score < 7) return 'var(--color-secondary)';
  if (score < 9) return 'var(--color-warning-amber)';
  return 'var(--color-warning)';
};

export interface SeverityInfo {
  label: string;
  color: string;
  desc: string;
}

export const getStressSeverity = (score: number): SeverityInfo => {
  if (score === 0) {
    return {
      label: 'No Data',
      color: 'var(--text-muted)',
      desc: 'Write a journal entry to begin tracking',
    };
  }
  if (score < 4) {
    return {
      label: 'Calm / Low',
      color: 'var(--color-success)',
      desc: 'Excellent emotional balance. Keep studying steadily!',
    };
  }
  if (score < 7) {
    return {
      label: 'Moderate',
      color: 'var(--color-secondary)',
      desc: 'Experiencing regular exam pressure. Rest is recommended.',
    };
  }
  if (score < 9) {
    return {
      label: 'High Stress',
      color: 'var(--color-warning-amber)',
      desc: 'Stress levels are elevated. Try a breathing break!',
    };
  }
  return {
    label: 'Burnout Risk',
    color: 'var(--color-warning)',
    desc: 'High risk of academic fatigue. Stop studying and talk to Aura immediately.',
  };
};
