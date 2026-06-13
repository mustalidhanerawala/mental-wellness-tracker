import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { MessageSquare, Send, RefreshCw, AlertCircle, Heart } from 'lucide-react';

export const CompanionChat: React.FC = () => {
  const { chatHistory, addChatMessage, clearChatHistory, examType } = useApp();
  const { sendMessageToCompanion, isChatting, error } = useGemini();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { text: 'Mock test scores', label: '😭 Mock test was bad...' },
    { text: 'Syllabus backlog panic', label: '📚 syllabus is too vast...' },
    { text: 'Self-doubt and comparison', label: '👥 comparing myself to peers' },
    { text: 'Can we do a breathing exercise?', label: '🧘 guide me through breathing' },
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isChatting]);

  // Handle message send
  const handleSend = async (text: string) => {
    if (!text.trim() || isChatting) return;

    // 1. Add user message to local state
    addChatMessage('user', text);
    setInputValue('');

    // 2. Fetch GenAI companion response
    try {
      // Create current history representation for model
      const updatedHistory = [...chatHistory, { role: 'user' as const, text, timestamp: new Date().toISOString() }];
      await sendMessageToCompanion(updatedHistory, text);
    } catch (e) {
      console.error('Failed to communicate with Aura:', e);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  return (
    <div className="glass-panel chat-container">
      {/* Chat Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--color-primary-glow)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <MessageSquare size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>Chat with Aura</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '6px', height: '6px', background: 'var(--color-success)', borderRadius: '50%', display: 'inline-block' }}></span>
              Empathetic Counselor Active
            </span>
          </div>
        </div>
        
        {chatHistory.length > 0 && (
          <button
            onClick={clearChatHistory}
            className="btn btn-ghost"
            style={{ padding: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}
            title="Clear Chat Logs"
          >
            <RefreshCw size={14} /> Clear Chat
          </button>
        )}
      </div>

      {/* Messages Window */}
      <div className="chat-messages">
        {chatHistory.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '0 1rem' }}>
            <div className="welcome-logo float-anim" style={{ marginBottom: '1.5rem' }}>
              <Heart size={32} />
            </div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>I'm Aura, your wellness partner</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '380px', lineHeight: 1.5 }}>
              A competitive test like <strong>{examType}</strong> is a journey of endurance. I am here 24/7 to listen to your worries, share study-break meditations, or help you breathe through exam panic.
            </p>
            <div style={{ marginTop: '1.5rem', width: '100%', maxWidth: '380px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.5rem' }}>
                Tap a topic to start:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(`I want to talk about my ${p.text}`)}
                    className="quick-prompt-btn"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ alignSelf: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Conversation sync established
            </div>
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble chat-bubble-${msg.role}`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {msg.text}
              </div>
            ))}
          </>
        )}
        
        {/* Typing indicator */}
        {isChatting && (
          <div className="typing-indicator">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Aura is typing</span>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        
        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.15)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-warning)', fontSize: '0.8rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input section */}
      <div>
        {chatHistory.length > 0 && (
          <div className="quick-prompts-grid">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(`I want to talk about my ${p.text}`)}
                className="quick-prompt-btn"
                disabled={isChatting}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
        <div className="chat-input-area">
          <input
            type="text"
            className="glass-input"
            placeholder={isChatting ? 'Aura is formulating a response...' : 'Type your feelings... ("I feel stressed about my schedule")'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isChatting}
          />
          <button
            onClick={() => handleSend(inputValue)}
            className="btn btn-primary"
            disabled={!inputValue.trim() || isChatting}
            style={{ padding: '0.75rem 1.25rem' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
