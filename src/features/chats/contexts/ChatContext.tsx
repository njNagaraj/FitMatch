import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Chat, Message } from '../../../shared/types';
import { chatService } from '../../../api/services/chatService';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { supabase } from '../../../api/supabaseClient';

interface ChatContextType {
  chats: Chat[];
  loading: boolean;
  sendMessage: (activityId: string, text: string) => Promise<Message>;
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

  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase.channel('messages-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // --- DEBUG LOG ---
          // This log will appear in your browser's developer console when a new message is received.
          // If you send a message and this log DOES NOT appear, it means:
          // 1. You may have forgotten to enable "Realtime" for the 'messages' table in your Supabase dashboard (Database > Replication).
          // 2. Your Row Level Security (RLS) policies for the 'messages' table are preventing the new message from being sent to you.
          console.log('🎉 [FitMatch Realtime] New message received:', payload.new);

          const newMessage: Message = {
            id: payload.new.id,
            timestamp: new Date(payload.new.created_at),
            senderId: payload.new.sender_id,
            text: payload.new.text,
            isSystemMessage: payload.new.is_system_message,
          };
          const activityId = payload.new.activity_id;

          setChats(prevChats => {
            const chatExists = prevChats.some(c => c.activityId === activityId);
            if (chatExists) {
              return prevChats.map(chat =>
                chat.activityId === activityId
                  ? { ...chat, messages: [...chat.messages, newMessage] }
                  : chat
              );
            } else {
              // New chat created by the first message (e.g., from a system message)
              const newChat: Chat = {
                id: activityId,
                activityId,
                messages: [newMessage],
              };
              return [...prevChats, newChat];
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [isAuthenticated]);
  
  const sendMessage = async (activityId: string, text: string): Promise<Message> => {
    if (!text.trim() || !currentUser) {
        throw new Error("Message is empty or user not logged in.");
    }
    // The message will be added to state via the realtime subscription,
    // so we just need to call the service.
    return await chatService.sendMessage(activityId, text, currentUser.id);
  };

  const value = {
    chats,
    loading,
    sendMessage,
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