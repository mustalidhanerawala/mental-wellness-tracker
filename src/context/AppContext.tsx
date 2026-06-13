/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface JournalAnalysis {
  stressScore: number;
  emotions: string[];
  triggers: string[];
  distortions: Array<{ name: string; description: string }>;
  empatheticMessage: string;
  copingTip: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  moodEmoji: string;
  moodLabel: string;
  stressScore: number; // User self-assessed (1-10)
  analysis: JournalAnalysis | null;
}

export type ExamType = 'JEE' | 'NEET' | 'UPSC' | 'GATE' | 'CAT' | 'CUET' | 'BOARD' | 'OTHER';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface AppContextProps {
  apiKey: string;
  userName: string;
  examType: ExamType;
  journals: JournalEntry[];
  chatHistory: ChatMessage[];
  isConfigured: boolean;
  saveSetup: (name: string, exam: ExamType, key: string) => void;
  addJournal: (content: string, moodEmoji: string, moodLabel: string, userStress: number) => JournalEntry;
  updateJournalAnalysis: (id: string, analysis: JournalAnalysis) => void;
  clearUserData: () => void;
  addChatMessage: (role: 'user' | 'model', text: string) => void;
  clearChatHistory: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mental_wellness_tracker_data_v1';

interface SavedState {
  apiKey: string;
  userName: string;
  examType: ExamType;
  journals: JournalEntry[];
  chatHistory: ChatMessage[];
  isConfigured: boolean;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SavedState>(() => {
    const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          apiKey: parsed.apiKey || envKey,
        };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return {
      apiKey: envKey,
      userName: '',
      examType: 'OTHER',
      journals: [],
      chatHistory: [],
      isConfigured: false,
    };
  });

  // Sync state with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const saveSetup = (name: string, exam: ExamType, key: string) => {
    setState((prev) => ({
      ...prev,
      userName: name,
      examType: exam,
      apiKey: key,
      isConfigured: true,
    }));
  };

  const addJournal = (content: string, moodEmoji: string, moodLabel: string, userStress: number): JournalEntry => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      content,
      moodEmoji,
      moodLabel,
      stressScore: userStress,
      analysis: null,
    };

    setState((prev) => ({
      ...prev,
      journals: [newEntry, ...prev.journals],
    }));

    return newEntry;
  };

  const updateJournalAnalysis = (id: string, analysis: JournalAnalysis) => {
    setState((prev) => ({
      ...prev,
      journals: prev.journals.map((j) => (j.id === id ? { ...j, analysis } : j)),
    }));
  };

  const clearUserData = () => {
    setState({
      apiKey: '',
      userName: '',
      examType: 'OTHER',
      journals: [],
      chatHistory: [],
      isConfigured: false,
    });
  };

  const addChatMessage = (role: 'user' | 'model', text: string) => {
    const newMessage: ChatMessage = {
      role,
      text,
      timestamp: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage],
    }));
  };

  const clearChatHistory = () => {
    setState((prev) => ({
      ...prev,
      chatHistory: [],
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        saveSetup,
        addJournal,
        updateJournalAnalysis,
        clearUserData,
        addChatMessage,
        clearChatHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
