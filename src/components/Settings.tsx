import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { ExamType } from '../context/AppContext';
import { Sparkles, Key, User, BookOpen, AlertCircle } from 'lucide-react';

interface SettingsProps {
  onSetupComplete?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSetupComplete }) => {
  const { apiKey, userName, examType, isConfigured, saveSetup, clearUserData } = useApp();
  
  const [name, setName] = useState(userName);
  const [key, setKey] = useState(apiKey);
  const [exam, setExam] = useState<ExamType>(examType);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const exams: { value: ExamType; label: string; desc: string }[] = [
    { value: 'JEE', label: 'JEE', desc: 'Joint Entrance Examination' },
    { value: 'NEET', label: 'NEET', desc: 'National Eligibility cum Entrance Test' },
    { value: 'UPSC', label: 'UPSC', desc: 'Civil Services Examination' },
    { value: 'GATE', label: 'GATE', desc: 'Graduate Aptitude Test in Engineering' },
    { value: 'CAT', label: 'CAT', desc: 'Common Admission Test' },
    { value: 'CUET', label: 'CUET', desc: 'Common University Entrance Test' },
    { value: 'BOARD', label: 'BOARD', desc: 'Class 10 / 12 Board Exams' },
    { value: 'OTHER', label: 'OTHER', desc: 'Other Competitive Exams' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    saveSetup(name.trim(), exam, key.trim());
    setErrorMsg(null);
    if (onSetupComplete) {
      onSetupComplete();
    }
  };

  const handleEnterDemoMode = () => {
    saveSetup('Demo Scholar', 'JEE', 'DEMO_KEY');
    if (onSetupComplete) {
      onSetupComplete();
    }
  };

  return (
    <div className="welcome-container">
      <div className="glass-panel welcome-card">
        <div className="welcome-logo">
          <Sparkles />
        </div>
        <h1 className="title-gradient" style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          {isConfigured ? 'Wellness Settings' : 'Welcome to Aura'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {isConfigured 
            ? 'Customize your exam profile and API settings' 
            : 'Your Generative AI-powered companion to beat board exam and competitive test stress.'}
        </p>

        <form onSubmit={handleSave} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* User Name */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              <User size={16} color="var(--color-primary)" />
              What should Aura call you?
            </label>
            <input
              type="text"
              className="glass-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Exam Type Selector */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              <BookOpen size={16} color="var(--color-primary)" />
              Which exam are you preparing for?
            </label>
            <div className="exam-grid">
              {exams.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`exam-card ${exam === item.value ? 'active' : ''}`}
                  onClick={() => setExam(item.value)}
                  title={item.desc}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gemini API Key */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              <Key size={16} color="var(--color-primary)" />
              Gemini API Key (Optional)
            </label>
            
            {!!import.meta.env.VITE_GEMINI_API_KEY && (
              <span style={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                🟢 Integrated Gemini API key detected from environment.
              </span>
            )}
            
            <input
              type="password"
              className="glass-input"
              placeholder={import.meta.env.VITE_GEMINI_API_KEY ? "••••••••••••••••••••••••••••" : "Paste your Gemini API key here"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            
            <div className="info-banner">
              <AlertCircle size={20} />
              <div>
                <strong>Why an API Key?</strong> Aura uses Gemini 1.5 Flash to analyze stress. If left blank, Aura runs in <strong>Demo Mode</strong> with mock responses. Get a free API key at the{' '}
                <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">
                  Google AI Studio
                </a>. Keys are stored locally and never sent to any server.
              </div>
            </div>
          </div>

          {errorMsg && (
            <p style={{ color: 'var(--color-warning)', fontSize: '0.85rem', fontWeight: 500 }}>
              {errorMsg}
            </p>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {isConfigured ? 'Save Changes' : 'Start My Journey'}
            </button>
            {!isConfigured && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleEnterDemoMode}
              >
                Try Demo Mode
              </button>
            )}
          </div>
        </form>

        {isConfigured && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data and start over? This cannot be undone.')) {
                  clearUserData();
                  setName('');
                  setKey('');
                  setExam('OTHER');
                }
              }}
              className="btn btn-danger"
              style={{ width: '100%' }}
            >
              Reset All App Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
