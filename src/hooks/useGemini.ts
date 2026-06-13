import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApp } from '../context/AppContext';
import type { JournalAnalysis, ChatMessage } from '../context/AppContext';
import { getJournalAnalysisPrompt, getSystemPromptForCompanion } from '../utils/geminiPromptTemplates';
import { generateMockAnalysis, generateMockChatResponse } from '../utils/mockHelpers';

export const useGemini = () => {
  const { apiKey, userName, examType, addChatMessage } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeJournalEntry = async (content: string): Promise<JournalAnalysis> => {
    setIsAnalyzing(true);
    setError(null);

    // If Demo Mode (no key or DEMO)
    if (!apiKey || apiKey === 'DEMO_KEY') {
      return new Promise((resolve) => {
        setTimeout(() => {
          setIsAnalyzing(false);
          resolve(generateMockAnalysis(content, userName, examType));
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
    } catch (e) {
      console.error('Gemini Journal Analysis Error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Failed to connect to Gemini API. Falling back to demo analysis.';
      // Fallback on error to ensure app never crashes
      setIsAnalyzing(false);
      setError(errorMessage);
      return generateMockAnalysis(content, userName, examType);
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
          const responseText = generateMockChatResponse(newMessage, userName, examType);
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
    } catch (e) {
      console.error('Gemini Companion Chat Error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Failed to get chat response. Falling back to demo mode.';
      setIsChatting(false);
      setError(errorMessage);
      const fallbackMsg = generateMockChatResponse(newMessage, userName, examType);
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
