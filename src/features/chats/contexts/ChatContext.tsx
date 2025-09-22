import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Chat, Message } from '../../../shared/types';
import { chatService } from '../../../api/services/chatService';
import { useAuth } from '../../../auth/contexts/AuthContext';

interface ChatContextType {
  chats: Chat[];
  loading: boolean;
  sendMessage: (activityId: string, text: string) => Promise<void>;
  createChatForActivity: (activityId: string, initialMessage: string) => void;
  addSystemMessageToChat: (activityId: string, text: string) => boolean; // Returns true if chat existed
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, currentUser } = useAuth();

  const fetchChats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const fetchedChats = await chatService.getChats();
      setChats(fetchedChats);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);
  
  const sendMessage = async (activityId: string, text: string) => {
    if (!text.trim() || !currentUser) return;
    try {
      const newMessage = await chatService.sendMessage(activityId, text, currentUser.id);
      setChats(prev => prev.map(chat => 
        chat.activityId === activityId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      ));
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const createChatForActivity = (activityId: string, initialMessage: string) => {
    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'system',
      text: initialMessage,
      timestamp: new Date(),
    };
    const newChat: Chat = {
      id: activityId,
      activityId: activityId,
      messages: [systemMessage],
    };
    setChats(prev => [...prev, newChat]);
  };
  
  const addSystemMessageToChat = (activityId: string, text: string): boolean => {
    let chatExists = false;
    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'system',
      text: text,
      timestamp: new Date(),
    };
    setChats(prev => prev.map(chat => {
      if (chat.activityId === activityId) {
        chatExists = true;
        return { ...chat, messages: [...chat.messages, systemMessage] };
      }
      return chat;
    }));
    return chatExists;
  };

  const value = {
    chats,
    loading,
    sendMessage,
    createChatForActivity,
    addSystemMessageToChat
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChats = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChats must be used within a ChatProvider');
  }
  return context;
};
