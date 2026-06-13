import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Clock, BookOpen, AlertCircle, Coffee } from 'lucide-react';
import { getMindfulnessBreakTip } from '../utils/timerHelpers';

type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

const MODE_DURATIONS: Record<TimerMode, number> = {
  FOCUS: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const playAlertSound = () => {
  try {
    // Audio fallback using web audio api so we don't need external assets
    const AudioContextClass = window.AudioContext || (window as unknown as WindowWithWebkit).webkitAudioContext;
    if (AudioContextClass) {
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    }
  } catch (e) {
    console.warn('Audio Context alert block:', e);
  }
};

export const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('FOCUS');
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('General Studies');
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const changeMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setSecondsRemaining(MODE_DURATIONS[newMode]);
  }, []);

  const handleTimerComplete = useCallback(() => {
    if (mode === 'FOCUS') {
      changeMode('SHORT_BREAK');
      alert('Focus session complete! Time to take a mindfulness break.');
    } else {
      changeMode('FOCUS');
      alert('Break complete! Let\'s return to study focus.');
    }
  }, [mode, changeMode]);

  // Timer Countdown Logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Handle Timer Completion
  useEffect(() => {
    if (secondsRemaining <= 0 && isActive) {
      const timer = setTimeout(() => {
        setIsActive(false);
        playAlertSound();
        handleTimerComplete();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [secondsRemaining, isActive, handleTimerComplete]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(MODE_DURATIONS[mode]);
  };

  const handleSkip = () => {
    const nextMode = mode === 'FOCUS' ? 'SHORT_BREAK' : 'FOCUS';
    changeMode(nextMode);
  };

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate circular SVG progress values
  const totalDuration = MODE_DURATIONS[mode];
  const elapsed = totalDuration - secondsRemaining;
  const progressFraction = elapsed / totalDuration;
  
  const svgRadius = 90;
  const svgStroke = 6;
  const normalizedRadius = svgRadius - svgStroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progressFraction * circumference;

  const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'General Studies', 'Writing & Revision'];
  const breakTip = getMindfulnessBreakTip(mode);

  return (
    <div className="dashboard-grid">
      
      {/* Pomodoro circular timer card */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--color-primary)" />
          Paced Study Timer
        </h3>

        {mode === 'FOCUS' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--color-primary-glow)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
            <BookOpen size={14} /> Currently Focusing: {selectedSubject}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <svg className="timer-circle-svg" width="220" height="220" viewBox="0 0 200 200">
            <circle
              className="timer-circle-bg"
              cx="100"
              cy="100"
              r={normalizedRadius}
            />
            <circle
              className="timer-circle-fill"
              cx="100"
              cy="100"
              r={normalizedRadius}
              stroke={mode === 'FOCUS' ? 'var(--color-primary)' : 'var(--color-success)'}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
            />
          </svg>
          <div className="timer-text-container">
            <div className="timer-time">{formatTime(secondsRemaining)}</div>
            <div className="timer-mode" style={{ color: mode === 'FOCUS' ? 'var(--text-secondary)' : 'var(--color-success)' }}>
              {mode.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <button onClick={handleStartPause} className="btn btn-primary">
            {isActive ? <Pause size={16} /> : <Play size={16} />}
            {isActive ? 'Pause' : 'Focus'}
          </button>
          <button onClick={handleReset} className="btn btn-secondary">
            <RotateCcw size={16} />
            Reset
          </button>
          <button onClick={handleSkip} className="btn btn-ghost" title="Skip Session">
            <SkipForward size={16} />
          </button>
        </div>
      </div>

      {/* Focus configuration & break helper */}
      <div className="sidebar-layout">
        
        {/* Study Focus Selector */}
        {mode === 'FOCUS' ? (
          <div className="glass-panel">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} color="var(--color-primary)" />
              Select Active Topic
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`exam-card ${selectedSubject === sub ? 'active' : ''}`}
                  style={{ textAlign: 'left', padding: '0.65rem 1rem' }}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Break Mindfulness Guide card */
          breakTip && (
            <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.05) 0%, rgba(56, 189, 248, 0.05) 100%)', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Coffee size={18} />
                {breakTip.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {breakTip.tip}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <AlertCircle size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
                <span>
                  Tip: A true break clears details from active memory, allowing your brain to rest and compile formulas.
                </span>
              </div>
            </div>
          )
        )}

        {/* Short & Long break mode selectors */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Timer Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => changeMode('FOCUS')}
              className={`nav-item ${mode === 'FOCUS' ? 'active' : ''}`}
              style={{ justifyContent: 'space-between', padding: '0.65rem 1rem' }}
            >
              <span>Focus Session</span>
              <span>25m</span>
            </button>
            <button
              onClick={() => changeMode('SHORT_BREAK')}
              className={`nav-item ${mode === 'SHORT_BREAK' ? 'active' : ''}`}
              style={{ justifyContent: 'space-between', padding: '0.65rem 1rem' }}
            >
              <span>Short Break</span>
              <span>5m</span>
            </button>
            <button
              onClick={() => changeMode('LONG_BREAK')}
              className={`nav-item ${mode === 'LONG_BREAK' ? 'active' : ''}`}
              style={{ justifyContent: 'space-between', padding: '0.65rem 1rem' }}
            >
              <span>Long Break</span>
              <span>15m</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
