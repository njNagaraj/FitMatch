import React, { useState, useRef, useEffect } from 'react';
import { FitMatchData } from '../useFitMatchData';
import { Chat, Message } from '../types';

const ChatView: React.FC<{ chat: Chat; data: FitMatchData; onBack: () => void; }> = ({ chat, data, onBack }) => {
    const { getActivityById, getUserById, sendMessage, currentUser } = data;
    const activity = getActivityById(chat.activityId);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [chat.messages]);

    if (!activity) return <div>Activity not found</div>;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(chat.activityId, newMessage);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-light-bg-secondary dark:bg-dark-bg-secondary border-l border-light-border dark:border-dark-border">
            <header className="p-4 border-b border-light-border dark:border-dark-border flex items-center flex-shrink-0">
                 <button onClick={onBack} className="lg:hidden mr-4 p-2 -ml-2">&larr;</button>
                 <h2 className="font-bold text-lg">{activity.title}</h2>
            </header>
            <div className="flex-1 p-4 overflow-y-auto">
                {chat.messages.map(message => {
                    const sender = getUserById(message.senderId);
                    const isCurrentUser = message.senderId === currentUser.id;
                    return (
                        <div key={message.id} className={`flex items-end gap-2 my-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {!isCurrentUser && <img src={sender?.avatarUrl} alt={sender?.name} className="w-8 h-8 rounded-full"/>}
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 ${isCurrentUser ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {!isCurrentUser && <p className="text-xs font-bold mb-1">{sender?.name}</p>}
                                <p>{message.text}</p>
                                <p className={`text-xs mt-1 opacity-70 ${isCurrentUser ? 'text-right' : 'text-left'}`}>{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            <footer className="p-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">Send</button>
                </form>
            </footer>
        </div>
    )
}

export const Chats: React.FC<{ data: FitMatchData }> = ({ data }) => {
  const { chats, myActivities, getActivityById, getUserById } = data;
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  
  const userChatIds = new Set(myActivities.map(a => a.id));
  const userChats = chats.filter(c => userChatIds.has(c.activityId));
  
  const selectedChat = userChats.find(c => c.id === selectedChatId);

  return (
    <div className="h-full flex">
        <div className={`w-full lg:w-1/3 border-r border-light-border dark:border-dark-border overflow-y-auto ${selectedChatId ? 'hidden lg:block' : 'block'}`}>
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
                        {lastMessage && <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">{sender?.name}: {lastMessage.text}</p>}
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
                <ChatView chat={selectedChat} data={data} onBack={() => setSelectedChatId(null)}/>
            ) : (
                <div className="text-center text-light-text-secondary dark:text-dark-text-secondary">
                    <p>Select a chat to start messaging.</p>
                </div>
            )}
        </div>
    </div>
  );
};
