import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApp } from '../context/AppContext';
import type { JournalAnalysis, ChatMessage } from '../context/AppContext';
import { getJournalAnalysisPrompt, getSystemPromptForCompanion } from '../utils/geminiPromptTemplates';

export const useGemini = () => {
  const { apiKey, userName, examType, addChatMessage } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to generate mock analysis for Demo Mode
  const generateMockAnalysis = (content: string): JournalAnalysis => {
    const stressScore = content.length % 7 + 4; // Mock score between 4 and 10
    const emotions = ['Anxiety', 'Fatigue'];
    if (content.toLowerCase().includes('fail') || content.toLowerCase().includes('doubt')) {
      emotions.push('Self-Doubt');
    } else {
      emotions.push('Determination');
    }
    
    const triggers = ['Exam Preparation'];
    if (content.toLowerCase().includes('test') || content.toLowerCase().includes('mock')) {
      triggers.push('Mock Test Scores');
    }
    if (content.toLowerCase().includes('time') || content.toLowerCase().includes('schedule')) {
      triggers.push('Time Management');
    }
    if (content.toLowerCase().includes('parent') || content.toLowerCase().includes('family')) {
      triggers.push('Family Expectations');
    }

    const distortions = [];
    if (content.toLowerCase().includes('never') || content.toLowerCase().includes('always')) {
      distortions.push({
        name: 'All-or-Nothing Thinking',
        description: 'You are viewing things in black-and-white categories. Remember, one challenging study session or mock test score does not determine your entire performance.'
      });
    }
    if (content.toLowerCase().includes('fail') || content.toLowerCase().includes('ruin')) {
      distortions.push({
        name: 'Catastrophizing',
        description: 'You are anticipating the worst possible outcome. Let\'s pause and take things one step, one topic at a time. The worst case is rarely the reality.'
      });
    }

    return {
      stressScore,
      emotions,
      triggers,
      distortions,
      empatheticMessage: `Hi ${userName}, I hear how much weight you are carrying right now. Preparing for the ${examType} is an exhausting journey, and it's completely natural to feel overwhelmed. Please remember that this exam is a milestone, not a measure of your worth as a person. Take a deep breath—you are doing your best, and that is more than enough.`,
      copingTip: 'To help release this immediate stress, let\'s try a 2-minute Box Breathing exercise. Go to the Mindfulness tab and follow the breathing guide.'
    };
  };

  // Helper to generate mock chat response for Demo Mode
  const generateMockChatResponse = (text: string): string => {
    const query = text.toLowerCase();
    if (query.includes('mock') || query.includes('test') || query.includes('score')) {
      return `I understand, ${userName}. Mock tests are designed to highlight areas of improvement, not to define your final results. It's completely normal to feel anxious about scores, but try to treat them as practice guides. Let's list 1 or 2 small topics you want to review tomorrow, and then close the books for tonight. How does that sound?`;
    }
    if (query.includes('sleep') || query.includes('tired') || query.includes('exhausted')) {
      return `Burnout is very real during ${examType} prep. Rest is not a reward for studying; it is a vital part of the preparation itself. Your brain needs sleep to consolidate what you've learned. Can we agree to stop studying 30 minutes earlier tonight and try a relaxing wind-down routine?`;
    }
    if (query.includes('forget') || query.includes('remember')) {
      return `It feels like everything is slipping away, doesn't it? That is a very common trick that anxiety plays on your mind. When stress levels are high, accessing information is harder, making you feel like you've forgotten it. When you calm your mind (e.g. via deep breathing), the recall will return. You've worked hard, trust the process!`;
    }
    return `Thank you for sharing that with me, ${userName}. It takes courage to open up about exam stress. I am right here with you throughout your ${examType} prep. What is one small thing we can focus on right now to make your day feel a little lighter?`;
  };

  const analyzeJournalEntry = async (content: string): Promise<JournalAnalysis> => {
    setIsAnalyzing(true);
    setError(null);

    // If Demo Mode (no key or DEMO)
    if (!apiKey || apiKey === 'DEMO_KEY') {
      return new Promise((resolve) => {
        setTimeout(() => {
          setIsAnalyzing(false);
          resolve(generateMockAnalysis(content));
        }, 1500);
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // We use gemini-1.5-flash as it is fast, cheap, and handles structured JSON output perfectly
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const prompt = getJournalAnalysisPrompt(userName, examType, content);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const parsedAnalysis: JournalAnalysis = JSON.parse(responseText);
      setIsAnalyzing(false);
      return parsedAnalysis;
    } catch (e: any) {
      console.error('Gemini Journal Analysis Error:', e);
      // Fallback on error to ensure app never crashes
      setIsAnalyzing(false);
      setError(e.message || 'Failed to connect to Gemini API. Falling back to demo analysis.');
      return generateMockAnalysis(content);
    }
  };

  const sendMessageToCompanion = async (
    chatHistory: ChatMessage[],
    newMessage: string
  ): Promise<string> => {
    setIsChatting(true);
    setError(null);

    // If Demo Mode
    if (!apiKey || apiKey === 'DEMO_KEY') {
      return new Promise((resolve) => {
        setTimeout(() => {
          setIsChatting(false);
          const responseText = generateMockChatResponse(newMessage);
          addChatMessage('model', responseText);
          resolve(responseText);
        }, 1500);
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const systemInstruction = getSystemPromptForCompanion(userName, examType);
      
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction,
      });

      // Format history for the Gemini API
      // Note: Gemini chat history must alternatingly match 'user' and 'model' and contain 'parts'
      const formattedHistory = chatHistory.map((msg) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      }));

      const chatSession = model.startChat({
        history: formattedHistory,
      });

      const result = await chatSession.sendMessage(newMessage);
      const responseText = result.response.text();

      addChatMessage('model', responseText);
      setIsChatting(false);
      return responseText;
    } catch (e: any) {
      console.error('Gemini Companion Chat Error:', e);
      setIsChatting(false);
      setError(e.message || 'Failed to get chat response. Falling back to demo mode.');
      const fallbackMsg = generateMockChatResponse(newMessage);
      addChatMessage('model', fallbackMsg);
      return fallbackMsg;
    }
  };

  return {
    analyzeJournalEntry,
    sendMessageToCompanion,
    isAnalyzing,
    isChatting,
    error,
  };
};
