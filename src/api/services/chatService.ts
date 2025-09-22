import { db } from '../mockDatabase';
import { Chat, Message } from '../../shared/types';

const SIMULATED_DELAY = 300;

export const chatService = {
  getChats: async (): Promise<Chat[]> => {
    console.log('API: Fetching all chats...');
    return new Promise(resolve => setTimeout(() => resolve([...db.chats]), SIMULATED_DELAY));
  },

  sendMessage: async (activityId: string, text: string, senderId: string): Promise<Message> => {
    console.log(`API: Sending message to chat for activity ${activityId}...`);
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId,
      text,
      timestamp: new Date(),
    };

    let chatExists = false;
    db.chats = db.chats.map(chat => {
      if (chat.activityId === activityId) {
        chatExists = true;
        return { ...chat, messages: [...chat.messages, newMessage] };
      }
      return chat;
    });

    // This case should ideally not happen as chats are created on join, but as a fallback:
    if (!chatExists) {
        const newChat: Chat = {
            id: activityId,
            activityId: activityId,
            messages: [newMessage],
        };
        db.chats.push(newChat);
    }
    
    return new Promise(resolve => setTimeout(() => resolve(newMessage), SIMULATED_DELAY));
  },
};
