import { useState, useCallback } from 'react';
import { Message, ChatState } from '../types';

export const useChatBox = () => {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    messages: [],
    isTyping: false,
  });

  const toggleChat = useCallback(() => {
    setChatState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const sendMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isTyping: true,
    }));

    // Simulate coach response
    setTimeout(() => {
      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for your message! I'll help you with that.",
        sender: 'coach',
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, coachResponse],
        isTyping: false,
      }));
    }, 1500);
  }, []);

  const closeChat = useCallback(() => {
    setChatState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    chatState,
    toggleChat,
    sendMessage,
    closeChat,
  };
}; 