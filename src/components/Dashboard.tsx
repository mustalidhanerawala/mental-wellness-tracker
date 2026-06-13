import React from 'react';
import { useApp } from '../context/AppContext';
import { Brain, FileText, Smile, Heart, TrendingUp } from 'lucide-react';
import { getStressSeverity } from '../utils/stressHelpers';
import { getExamMotivation } from '../utils/motivationHelpers';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { userName, examType, journals } = useApp();

  // 1. Calculate Statistics
  const totalJournals = journals.length;
  const recentJournals = journals.slice(0, 7); // Last 7 entries
  
  // Calculate average self-assessed stress
  const averageStress = totalJournals > 0
    ? (journals.reduce((sum, j) => sum + j.stressScore, 0) / totalJournals).toFixed(1)
    : '0.0';

  // Calculate average AI-inferred stress score (if available)
  const analyzedJournals = journals.filter((j) => j.analysis !== null);
  const aiStressScore = analyzedJournals.length > 0
    ? (analyzedJournals.reduce((sum, j) => sum + (j.analysis?.stressScore || 0), 0) / analyzedJournals.length).toFixed(1)
    : null;

  // Extract all triggers
  const allTriggers = journals.reduce<string[]>((acc, j) => {
    if (j.analysis?.triggers) {
      j.analysis.triggers.forEach((t) => {
        if (!acc.includes(t)) acc.push(t);
      }
    );
    }
    return acc;
  }, []);



  // 2. Render Mood Line Chart (SVG)
  const renderMoodChart = () => {
    if (totalJournals < 2) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
          <TrendingUp size={24} style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
          <p style={{ fontSize: '0.85rem' }}>Write at least 2 journal entries to view your mood trends.</p>
        </div>
      );
    }

    // Map stress scores (1-10) to Y coordinate (0-100 where 0 is high stress and 100 is relaxed)
    // Map journals to X coordinate (spaced out evenly)
    const pointsData = [...recentJournals].reverse(); // Oldest to newest in the last 7
    const width = 500;
    const height = 150;
    const paddingX = 40;
    const paddingY = 20;

    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    const points = pointsData.map((j, index) => {
      const x = paddingX + (index / (pointsData.length - 1)) * chartWidth;
      // Invert stress score so higher stress is lower on chart or vice versa
      // Let's plot actual stress score: 10 (top, high stress) to 1 (bottom, calm)
      const stressPercent = (j.stressScore - 1) / 9; // 0 to 1
      const y = height - paddingY - stressPercent * chartHeight;
      return { x, y, label: new Date(j.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), score: j.stressScore };
    });

    const pathD = points.reduce((acc, p, index) => {
      return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return (
      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />

          {/* Grid Labels (Y-axis: High Stress / Low Stress) */}
          <text x={paddingX - 10} y={paddingY + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">10 (High)</text>
          <text x={paddingX - 10} y={height / 2 + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">5 (Mid)</text>
          <text x={paddingX - 10} y={height - paddingY + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">1 (Calm)</text>

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="var(--bg-primary)"
                stroke="var(--color-primary)"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
              />
              <text
                x={p.x}
                y={height - 2}
                fill="var(--text-muted)"
                fontSize="8"
                textAnchor="middle"
              >
                {p.label}
              </text>
              <text
                x={p.x}
                y={p.y - 10}
                fill="var(--color-primary)"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                {p.score}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // 3. Render Circular Stress Level Gauge (SVG)
  const displayStressLevel = parseFloat(aiStressScore !== null ? aiStressScore : averageStress);
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(displayStressLevel, 10) / 10) * circumference;



  const severity = getStressSeverity(displayStressLevel);

  return (
    <div className="dashboard-grid">
      <div className="sidebar-layout">
        
        {/* Welcome Section */}
        <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="brand-tagline" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
              Target Prep: {examType}
            </span>
            <h2 className="title-gradient" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
              Welcome back, {userName}!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              "Your mental wellness is your greatest strength during preparation."
            </p>
          </div>
          <Heart size={40} color="var(--color-accent)" style={{ opacity: 0.8 }} />
        </div>

        {/* Weekly Stress Trend */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--color-primary)" />
              Stress Track (Last 7 Entries)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Self-Assessed Score (1-10)</span>
          </div>
          {renderMoodChart()}
        </div>

        {/* Motivational Card */}
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.05) 0%, rgba(56, 189, 248, 0.05) 100%)', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Brain size={16} />
            Wellness Focus for {examType} Aspirants
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6 }}>
            "{getExamMotivation(examType)}"
          </p>
        </div>
      </div>

      <div className="sidebar-layout">
        
        {/* Stress Meter circular gauge */}
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Wellness Status</h3>
          <div className="stress-meter-container">
            <svg className="stress-meter-svg">
              {/* Track */}
              <circle
                stroke="rgba(255, 255, 255, 0.03)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius + stroke}
                cy={radius + stroke}
              />
              {/* Progress */}
              <circle
                stroke={severity.color}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius + stroke}
                cy={radius + stroke}
              />
            </svg>
            <div className="stress-value-overlay">
              <div className="stress-num" style={{ color: severity.color }}>
                {displayStressLevel > 0 ? displayStressLevel.toFixed(1) : '-'}
              </div>
              <div className="stress-lbl">Stress Index</div>
            </div>
          </div>
          <h4 style={{ color: severity.color, fontWeight: 700, marginBottom: '0.25rem' }}>{severity.label}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
            {severity.desc}
          </p>
          {displayStressLevel >= 7 && (
            <button
              onClick={() => setActiveTab('mindfulness')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', marginTop: '1rem' }}
            >
              Start Breathing Break
            </button>
          )}
        </div>

        {/* Triggers & Stats */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Stress Triggers</h3>
          {allTriggers.length > 0 ? (
            <div className="trigger-tag-cloud">
              {allTriggers.map((trigger, index) => (
                <span key={index} className="trigger-tag">
                  {trigger}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No triggers detected yet. Aura will extract triggers from your journals.
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <FileText size={18} color="var(--color-primary)" style={{ margin: '0 auto 0.25rem' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Journals</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{totalJournals}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <Smile size={18} color="var(--color-secondary)" style={{ margin: '0 auto 0.25rem' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Audits</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{analyzedJournals.length}</div>
          </div>
        </div>

      </div>
    </div>
  );
};
