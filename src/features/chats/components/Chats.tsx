import React, { useState } from 'react';
import { ChatView } from './ChatView';
import { useChats } from '../contexts/ChatContext';
import { useActivities } from '../../activities/contexts/ActivityContext';
import { useUsers } from '../../users/contexts/UserContext';
import { useAuth } from '../../../auth/contexts/AuthContext';


export const Chats: React.FC = () => {
  const { chats } = useChats();
  const { myActivities, getActivityById } = useActivities();
  const { getUserById } = useUsers();
  const { currentUser } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  
  const userChatIds = new Set(myActivities.map(a => a.id));
  const userChats = chats.filter(c => userChatIds.has(c.activityId));
  
  const selectedChat = userChats.find(c => c.id === selectedChatId);

  return (
    <div className="h-full flex">
        <div className={`w-full lg:w-1/3 border-r border-light-border dark:border-dark-border overflow-y-auto ${selectedChatId ? 'hidden lg:block' : 'block'}`} data-tour-id="chats-list">
            <div className="p-4 border-b border-light-border dark:border-dark-border">
                <h1 className="text-xl font-bold">Chats</h1>
            </div>
            <div>
            {userChats.length > 0 ? userChats.map(chat => {
                const activity = getActivityById(chat.activityId);
                const lastMessage = chat.messages[chat.messages.length - 1];
                const sender = lastMessage ? getUserById(lastMessage.senderId) : null;
                if (!activity) return null;
                return (
                    <button key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={`w-full text-left p-4 border-b border-light-border dark:border-dark-border hover:bg-primary-light dark:hover:bg-dark-bg-secondary ${selectedChatId === chat.id ? 'bg-primary-light dark:bg-dark-bg-secondary' : ''}`}>
                        <p className="font-bold">{activity.title}</p>
                        {lastMessage && (
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
                                {lastMessage.senderId === 'system' 
                                    ? <i className="opacity-80">{lastMessage.text}</i>
                                    : `${sender?.id === currentUser?.id ? 'You' : sender?.name}: ${lastMessage.text}`
                                }
                            </p>
                        )}
                    </button>
                )
            }) : (
                 <div className="p-4 text-center text-light-text-secondary dark:text-dark-text-secondary">
                    Join an activity to start chatting.
                </div>
            )}
            </div>
        </div>
        <div className={`flex-1 ${!selectedChatId ? 'hidden lg:flex' : 'flex'} items-center justify-center`}>
            {selectedChat ? (
                <ChatView chat={selectedChat} onBack={() => setSelectedChatId(null)}/>
            ) : (
                <div className="text-center text-light-text-secondary dark:text-dark-text-secondary">
                    <p>Select a chat to start messaging.</p>
                </div>
            )}
        </div>
    </div>
  );
};