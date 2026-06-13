import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Wind, Play, Pause, RotateCcw, Brain, Star } from 'lucide-react';

type BreathingMode = 'BOX' | '478' | 'EQUAL';
type BreathPhase = 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT';

interface PhaseConfig {
  phase: BreathPhase;
  duration: number; // in seconds
  label: string;
  instruction: string;
  circleScale: number; // 0.8 to 1.4
}

// Setup Phase Sequences for each mode
const getModeSequence = (selectedMode: BreathingMode): PhaseConfig[] => {
  switch (selectedMode) {
    case '478':
      return [
        { phase: 'INHALE', duration: 4, label: 'Inhale', instruction: 'Breathe in quietly through your nose...', circleScale: 1.4 },
        { phase: 'HOLD_IN', duration: 7, label: 'Hold', instruction: 'Keep the air in, calm your mind...', circleScale: 1.4 },
        { phase: 'EXHALE', duration: 8, label: 'Exhale', instruction: 'Whoosh the air out completely...', circleScale: 0.8 },
      ];
    case 'EQUAL':
      return [
        { phase: 'INHALE', duration: 4, label: 'Inhale', instruction: 'Inhale deeply and steadily...', circleScale: 1.4 },
        { phase: 'EXHALE', duration: 4, label: 'Exhale', instruction: 'Release the breath smoothly...', circleScale: 0.8 },
      ];
    case 'BOX':
    default:
      return [
        { phase: 'INHALE', duration: 4, label: 'Inhale', instruction: 'Inhale slowly, feeling your chest expand...', circleScale: 1.4 },
        { phase: 'HOLD_IN', duration: 4, label: 'Hold', instruction: 'Hold the breath, letting stress dissolve...', circleScale: 1.4 },
        { phase: 'EXHALE', duration: 4, label: 'Exhale', instruction: 'Exhale gently, releasing all tension...', circleScale: 0.8 },
        { phase: 'HOLD_OUT', duration: 4, label: 'Hold', instruction: 'Rest empty, feeling complete stillness...', circleScale: 0.8 },
      ];
  }
};

export const BreathingGuide: React.FC = () => {
  const [mode, setMode] = useState<BreathingMode>('BOX');
  const [isActive, setIsActive] = useState(false);
  const [breathingState, setBreathingState] = useState({
    phaseIndex: 0,
    secondsRemaining: 4, // default matching BOX inhale duration
    totalCycleCount: 0,
  });
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSequence = useMemo(() => getModeSequence(mode), [mode]);
  const activePhase = currentSequence[breathingState.phaseIndex];

  // Main Timer Logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setBreathingState((prev) => {
          if (prev.secondsRemaining <= 1) {
            const nextIdx = (prev.phaseIndex + 1) % currentSequence.length;
            const nextPhase = currentSequence[nextIdx];
            return {
              phaseIndex: nextIdx,
              secondsRemaining: nextPhase.duration,
              totalCycleCount: nextIdx === 0 ? prev.totalCycleCount + 1 : prev.totalCycleCount,
            };
          }
          return {
            ...prev,
            secondsRemaining: prev.secondsRemaining - 1,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, currentSequence]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setBreathingState({
      phaseIndex: 0,
      secondsRemaining: currentSequence[0].duration,
      totalCycleCount: 0,
    });
  };

  const handleModeChange = (newMode: BreathingMode) => {
    setIsActive(false);
    setMode(newMode);
    const newSequence = getModeSequence(newMode);
    setBreathingState({
      phaseIndex: 0,
      secondsRemaining: newSequence[0].duration,
      totalCycleCount: 0,
    });
  };

  // Calculate breathing progress fill percentage
  const totalDuration = activePhase.duration;
  const elapsed = totalDuration - breathingState.secondsRemaining;
  const progressPercent = isActive ? (elapsed / totalDuration) * 100 : 0;

  // Determine scale of inner circle based on interpolation between previous scale and current scale
  const getCircleTransform = () => {
    if (!isActive) return 'scale(1)';
    
    // Animate scale dynamically
    if (activePhase.phase === 'INHALE') {
      const currentScale = 0.8 + (progressPercent / 100) * 0.6; // from 0.8 to 1.4
      return `scale(${currentScale})`;
    } else if (activePhase.phase === 'EXHALE') {
      const currentScale = 1.4 - (progressPercent / 100) * 0.6; // from 1.4 to 0.8
      return `scale(${currentScale})`;
    } else {
      // Hold phase - keep constant
      return `scale(${activePhase.circleScale})`;
    }
  };

  const copingStrategies = [
    {
      badge: 'Test Panic',
      title: 'The 5-4-3-2-1 Grounding Method',
      text: 'Identify 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Instantly breaks an anxiety loop.',
    },
    {
      badge: 'Study Burnout',
      title: 'The 20-20-20 Rule',
      text: 'Every 20 minutes of studying, look at something 20 feet away for 20 seconds. Relieves ocular stress and re-centers cognitive load.',
    },
    {
      badge: 'Mock Test Worry',
      title: 'Productive Reframe',
      text: 'Write down: "Mock tests are mock tools. A mistake made today is a mistake avoided on exam day." Failure is just diagnostic data.',
    },
    {
      badge: 'Syllabus Backlog',
      title: 'Micro-Goal Pacing',
      text: 'Do not think of the 500-page book. Focus on reading 5 pages right now. Break goals into tiny chunks to bypass mental resistance.',
    },
  ];

  return (
    <div className="sidebar-layout">
      
      {/* Mindfulness Header */}
      <div className="glass-panel" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Wind size={32} color="var(--color-primary)" />
        <div>
          <h2 className="title-gradient" style={{ fontSize: '1.5rem' }}>Mindfulness & Coping Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Take a pause. Guided breathing lowers cortisol and returns your prefrontal cortex to maximum efficiency.
          </p>
        </div>
      </div>

      <div className="breathing-layout">
        
        {/* Breathing Animation Canvas */}
        <div className="glass-panel breathing-canvas">
          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => handleModeChange('BOX')}
              className={`nav-item ${mode === 'BOX' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              Box Breathing (4-4-4-4)
            </button>
            <button
              onClick={() => handleModeChange('478')}
              className={`nav-item ${mode === '478' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              4-7-8 Relax (4-7-8)
            </button>
            <button
              onClick={() => handleModeChange('EQUAL')}
              className={`nav-item ${mode === 'EQUAL' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              Calm Balance (4-4)
            </button>
          </div>

          {/* Circle Ring */}
          <div className="breathing-circle-outer">
            <div
              className="breathing-circle-inner"
              style={{
                transform: getCircleTransform(),
              }}
            >
              {isActive ? activePhase.label : 'Ready'}
            </div>
          </div>

          {/* Phase Guidance Text */}
          <div className="breathing-instruction">
            {isActive ? activePhase.instruction : 'Tap Play to start breathing'}
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', height: '20px' }}>
            {isActive && `${breathingState.secondsRemaining}s remaining • Cycle ${breathingState.totalCycleCount + 1}`}
          </div>

          <div className="breathing-progress-bar">
            <div
              className="breathing-progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Controls */}
          <div className="timer-controls">
            <button onClick={handleStartPause} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
              {isActive ? <Pause size={16} /> : <Play size={16} />}
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button onClick={handleReset} className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem' }}>
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Breathing benefits info */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={18} color="var(--color-secondary)" />
            Scientific Benefits
          </h3>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Parasympathetic Switch</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Slow breathing stimulates the vagus nerve, signaling the heart rate to slow down and turning off the "fight-or-flight" response.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Amplify Focus</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                By oxygenating the cerebral cortex, deep breaths clear chemical fatigue, allowing you to return to mock test prep with higher retention.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Emotional Baseline</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Just 4 full cycles of Box breathing creates a neurological baseline buffer, lowering sudden exam panic and cortisol spikes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coping strategies library */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Star size={18} color="var(--color-accent)" />
          Academic Coping Strategies Library
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Real-time cognitive tools to handle typical pressures of high-stakes preparation.
        </p>
        <div className="coping-grid">
          {copingStrategies.map((s, idx) => (
            <div key={idx} className="coping-card">
              <span className="coping-badge">{s.badge}</span>
              <h4 className="coping-title">{s.title}</h4>
              <p className="coping-text">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
