import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '../../../shared/types';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useActivities } from '../../activities/contexts/ActivityContext';
import { useUsers } from '../../users/contexts/UserContext';
import { useChats } from '../contexts/ChatContext';


export const ChatView: React.FC<{ chat: Chat; onBack: () => void; }> = ({ chat, onBack }) => {
    const { currentUser } = useAuth();
    const { getActivityById } = useActivities();
    const { getUserById } = useUsers();
    const { sendMessage } = useChats();

    const activity = getActivityById(chat.activityId);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [chat.messages]);

    if (!activity || !currentUser) return <div>Activity not found</div>;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newMessage.trim()) return;
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
                    if (message.senderId === 'system') {
                        return (
                            <div key={message.id} className="my-3 text-center">
                                <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary italic bg-light-bg dark:bg-dark-bg px-3 py-1 rounded-full">
                                    {message.text}
                                </span>
                            </div>
                        );
                    }
                    const sender = getUserById(message.senderId);
                    const isCurrentUser = message.senderId === currentUser.id;
                    return (
                        <div key={message.id} className={`flex items-end gap-2 my-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {!isCurrentUser && sender && <img src={sender.avatarUrl} alt={sender.name} className="w-8 h-8 rounded-full"/>}
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isCurrentUser ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
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
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary" />
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold hover:bg-primary-dark transition-colors rounded-md">Send</button>
                </form>
            </footer>
        </div>
    )
}