import { useState } from 'react';
import { useApp } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { JournalEntry } from './components/JournalEntry';
import { CompanionChat } from './components/CompanionChat';
import { BreathingGuide } from './components/BreathingGuide';
import { PomodoroTimer } from './components/PomodoroTimer';
import { Settings } from './components/Settings';
import { Brain, FileText, MessageSquare, Wind, Clock, Settings as SettingsIcon, Heart, ShieldAlert } from 'lucide-react';

function App() {
  const { isConfigured, userName, examType } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isConfigured) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>
        <Settings onSetupComplete={() => setActiveTab('dashboard')} />
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'journal':
        return <JournalEntry />;
      case 'chat':
        return <CompanionChat />;
      case 'mindfulness':
        return <BreathingGuide />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header className="app-header">
        <div className="brand-section">
          <Heart fill="var(--color-primary)" size={24} />
          <div>
            <h1 className="brand-title">AURA</h1>
            <span className="brand-tagline">Academic Wellness Partner</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Brain />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`nav-item ${activeTab === 'journal' ? 'active' : ''}`}
          >
            <FileText />
            Journaling
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          >
            <MessageSquare />
            Chat Companion
          </button>
          <button
            onClick={() => setActiveTab('mindfulness')}
            className={`nav-item ${activeTab === 'mindfulness' ? 'active' : ''}`}
          >
            <Wind />
            Mindfulness
          </button>
          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`nav-item ${activeTab === 'pomodoro' ? 'active' : ''}`}
          >
            <Clock />
            Study Timer
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <SettingsIcon />
            Settings
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginBottom: '3rem' }}>{renderActiveTab()}</main>

      {/* Footer Support Hotline / Disclaimer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Aura Student Support Network</strong> • Empathetic wellness companion for {userName} ({examType} Prep).
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Privacy Policy: Stored locally</span>
            <span>Security: Browser Sandboxed</span>
          </div>
        </div>

        {/* Crisis Disclaimer Banner */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(251, 113, 133, 0.03)', border: '1px solid rgba(251, 113, 133, 0.12)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
          <ShieldAlert size={18} color="var(--color-warning)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Safety Disclaimer:</strong> Aura is a wellness tracking companion and does not replace professional therapy or medical advice. If you are experiencing severe distress or thoughts of self-harm, please reach out to professional counseling services immediately:
            <div style={{ marginTop: '0.35rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span>📞 <strong>India Student Helpline (Tele-MANAS)</strong>: 14416 or 1800-891-4416 (24/7 Free)</span>
              <span>📞 <strong>Vandrevala Foundation Helpline</strong>: +91 9999 666 555 (24/7 Free)</span>
              <span>📞 <strong>AASRA</strong>: +91-9820466726</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
