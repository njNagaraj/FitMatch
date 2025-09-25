import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Chat, Message } from '../../../shared/types';
import { chatService } from '../../../api/services/chatService';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { supabase } from '../../../api/supabaseClient';

interface ChatContextType {
  chats: Chat[];
  loading: boolean;
  sendMessage: (activityId: string, text: string) => Promise<Message>;
  fetchChats: () => Promise<void>;
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

  // Create a stable dependency based on the IDs of the chats
  const chatIdsString = JSON.stringify(chats.map(c => c.id));

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleNewMessage = (payload: any) => {
      console.log('🎉 [Broadcast] New message received:', payload);

      // FIX: The actual message data is nested inside the 'payload' property of the broadcast event.
      const record = payload.payload?.record;
      if (!record) {
        console.warn('Received broadcast without a valid record property in its payload:', payload);
        return;
      }

      const activityId = record.activity_id;
      
      const newMessage: Message = {
        id: record.id,
        timestamp: new Date(record.created_at),
        senderId: record.sender_id,
        text: record.text,
        isSystemMessage: record.is_system_message,
        status: 'sent',
      };

      setChats(prevChats => {
        const chat = prevChats.find(c => c.activityId === activityId);
        
        // Prevent adding duplicate messages if the listener fires multiple times
        if (chat && chat.messages.some(m => m.id === newMessage.id)) {
            return prevChats;
        }
        
        if (chat) {
          return prevChats.map(c =>
            c.activityId === activityId
              ? { ...c, messages: [...c.messages, newMessage] }
              : c
          );
        } else {
          // If a message arrives for a chat that isn't in the state yet
          return [...prevChats, { id: activityId, activityId: activityId, messages: [newMessage] }];
        }
      });
    };

    const channels: any[] = chats.map(chat => {
      return supabase.channel(`activity:${chat.activityId}`, { config: { private: true } })
        .on('broadcast', { event: 'INSERT' }, handleNewMessage)
        .subscribe();
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, chatIdsString]);

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
    fetchChats,
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