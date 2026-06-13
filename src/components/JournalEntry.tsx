import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { JournalEntry as JournalType } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { Brain, Calendar, FileText, Sparkles, ShieldAlert, AlertCircle, Heart, ChevronDown, ChevronUp } from 'lucide-react';

export const JournalEntry: React.FC = () => {
  const { journals, addJournal, updateJournalAnalysis } = useApp();
  const { analyzeJournalEntry, isAnalyzing } = useGemini();

  const [journalContent, setJournalContent] = useState('');
  const [selectedMood, setSelectedMood] = useState({ emoji: '😐', label: 'Neutral' });
  const [stressScore, setStressScore] = useState(5);
  const [activeAnalysis, setActiveAnalysis] = useState<JournalType | null>(null);
  const [expandedJournalId, setExpandedJournalId] = useState<string | null>(null);

  const moods = [
    { emoji: '😭', label: 'Overwhelmed' },
    { emoji: '😴', label: 'Exhausted' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '🙂', label: 'Focused' },
    { emoji: '😄', label: 'Confident' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;

    // 1. Add journal to local state
    const newJournal = addJournal(
      journalContent,
      selectedMood.emoji,
      selectedMood.label,
      stressScore
    );

    // Reset writing area
    setJournalContent('');
    setStressScore(5);
    setSelectedMood({ emoji: '😐', label: 'Neutral' });

    // 2. Trigger Gemini analysis
    try {
      const result = await analyzeJournalEntry(newJournal.content);
      updateJournalAnalysis(newJournal.id, result);
      
      // Update local view with analysis
      setActiveAnalysis({
        ...newJournal,
        analysis: result
      });
    } catch (err) {
      console.error('Failed to analyze journal entry:', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 4) return 'var(--color-success)';
    if (score < 7) return 'var(--color-secondary)';
    if (score < 9) return 'var(--color-warning-amber)';
    return 'var(--color-warning)';
  };

  return (
    <div className="journal-layout">
      
      {/* Journal Writer Form */}
      <div className="sidebar-layout">
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--color-primary)" />
            Daily Wellness Journal
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Write down your study progress, exam worries, self-doubt, or mock test feelings. Expressing yourself helps lower stress levels.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Mood Selector */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                How do you feel overall today?
              </label>
              <div className="mood-selector">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    className={`mood-btn ${selectedMood.label === m.label ? 'active' : ''}`}
                    onClick={() => setSelectedMood(m)}
                  >
                    <span className="mood-emoji">{m.emoji}</span>
                    <span className="mood-label">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Self-Assessed Stress Level */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Self-Assessed Stress Score</label>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: getScoreColor(stressScore) }}>
                  {stressScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressScore}
                onChange={(e) => setStressScore(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>1 - Completely Calm</span>
                <span>5 - Moderate</span>
                <span>10 - Peak Anxiety / Panic</span>
              </div>
            </div>

            {/* Journal Textarea */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Open-Ended Log
              </label>
              <textarea
                className="glass-input journal-textarea"
                placeholder="Today was tough. Organic Chemistry makes no sense, and mock test score was lower than expected. I feel like I'm running out of time and might fail JEE..."
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isAnalyzing || !journalContent.trim()}
              style={{ width: '100%', gap: '0.75rem' }}
            >
              <Sparkles size={16} />
              {isAnalyzing ? 'Aura is analyzing emotional patterns...' : 'Save & Analyze Log'}
            </button>
          </form>
        </div>

        {/* Historical Journal Logs */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--color-secondary)" />
            Your Academic Wellness History
          </h3>
          {journals.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>
              Your past journal entries will appear here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {journals.map((j) => {
                const isExpanded = expandedJournalId === j.id;
                return (
                  <div key={j.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{j.moodEmoji}</span>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{j.moodLabel} Mood</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(j.date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', background: `${getScoreColor(j.stressScore)}15`, color: getScoreColor(j.stressScore) }}>
                          Stress: {j.stressScore}
                        </span>
                        <button
                          onClick={() => setExpandedJournalId(isExpanded ? null : j.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                          "{j.content}"
                        </p>
                        {j.analysis ? (
                          <button
                            onClick={() => setActiveAnalysis(j)}
                            className="btn btn-secondary"
                            style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem' }}
                          >
                            View Emotional Analysis Report
                          </button>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertCircle size={14} /> Analysis pending or unavailable.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results View */}
      <div>
        {isAnalyzing ? (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', textAlign: 'center' }}>
            <div className="welcome-logo float-anim">
              <Sparkles size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI Processing Log</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px' }}>
              Aura is analyzing open-ended journaling to extract stress triggers and emotional patterns...
            </p>
          </div>
        ) : activeAnalysis ? (
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Brain size={20} />
              Aura's Stress Trigger Analysis
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Analysis Report for entry logged on {new Date(activeAnalysis.date).toLocaleDateString()} at {new Date(activeAnalysis.date).toLocaleTimeString()}
            </p>

            <div className="analysis-scroll">
              {/* Stress score gauge */}
              {activeAnalysis.analysis && (
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: getScoreColor(activeAnalysis.analysis.stressScore), lineHeight: 1 }}>
                      {activeAnalysis.analysis.stressScore}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '0.25rem' }}>AI Stress</div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.15rem' }}>Detected Stress Quotient</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Our GenAI model detected a stress severity rating of {activeAnalysis.analysis.stressScore}/10. 
                      {activeAnalysis.analysis.stressScore >= 7 ? ' High intensity stress detected. Let\'s address this gently.' : ' This represents manageable stress levels.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Emotions */}
              {activeAnalysis.analysis?.emotions && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Core Emotions Identified:</h4>
                  <div className="analysis-emotions">
                    {activeAnalysis.analysis.emotions.map((emotion, idx) => (
                      <span key={idx} className="emotion-badge">
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stress Triggers */}
              {activeAnalysis.analysis?.triggers && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Academic Stress Triggers:</h4>
                  <div className="trigger-tag-cloud">
                    {activeAnalysis.analysis.triggers.map((trigger, idx) => (
                      <span key={idx} className="trigger-tag" style={{ borderLeft: '3px solid var(--color-primary)' }}>
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Empathetic Validation */}
              {activeAnalysis.analysis?.empatheticMessage && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>Empathetic Companion Feedback:</h4>
                  <p className="analysis-quote">
                    {activeAnalysis.analysis.empatheticMessage}
                  </p>
                </div>
              )}

              {/* Cognitive Distortions Reframing */}
              {activeAnalysis.analysis?.distortions && activeAnalysis.analysis.distortions.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldAlert size={14} color="var(--color-warning)" />
                    Cognitive Distortions & Reframes:
                  </h4>
                  <div className="distortions-list">
                    {activeAnalysis.analysis.distortions.map((distortion, idx) => (
                      <div key={idx} className="distortion-item">
                        <div className="distortion-name">
                          <Heart size={12} />
                          {distortion.name}
                        </div>
                        <p className="distortion-desc">{distortion.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coping Strategy Recommendation */}
              {activeAnalysis.analysis?.copingTip && (
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Heart size={18} color="var(--color-success)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 700, marginBottom: '0.25rem' }}>Recommended Coping Strategy</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {activeAnalysis.analysis.copingTip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <AlertCircle size={36} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Journal Analyzed Yet</h3>
            <p style={{ fontSize: '0.8rem', maxWidth: '280px' }}>
              Log your thoughts on the left and hit "Save & Analyze Log" to generate your first AI Emotional Pattern analysis report.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
