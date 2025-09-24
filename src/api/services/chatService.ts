import { supabase } from '../supabaseClient';
import { Chat, Message } from '../../shared/types';

const transformMessage = (msg: any): Message => ({
    id: msg.id,
    senderId: msg.sender_id,
    text: msg.text,
    timestamp: new Date(msg.created_at),
    isSystemMessage: msg.is_system_message
});


export const chatService = {
  getChats: async (): Promise<Chat[]> => {
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;

    const chatsMap = new Map<string, Chat>();

    for (const message of messages) {
        if (!chatsMap.has(message.activity_id)) {
            chatsMap.set(message.activity_id, {
                id: message.activity_id,
                activityId: message.activity_id,
                messages: [],
            });
        }
        chatsMap.get(message.activity_id)!.messages.push(transformMessage(message));
    }
    return Array.from(chatsMap.values());
  },
  
  // Note: createChatForActivity is now handled implicitly by the database trigger
  // which inserts a system message on join/leave events.

  sendMessage: async (activityId: string, text: string, senderId: string): Promise<Message> => {
    const { data, error } = await supabase.from('messages').insert({
        activity_id: activityId,
        text,
        sender_id: senderId
    }).select().single();
    
    if (error) throw error;
    return transformMessage(data);
  },
};