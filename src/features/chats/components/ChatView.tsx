import React, { useState, useRef, useEffect } from 'react';
import { Chat, Message } from '../../../shared/types';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useActivities } from '../../activities/contexts/ActivityContext';
import { useUsers } from '../../users/contexts/UserContext';
import { useChats } from '../contexts/ChatContext';

const ClockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const ChatView: React.FC<{ chat: Chat; onBack: () => void; }> = ({ chat, onBack }) => {
    const { currentUser } = useAuth();
    const { getActivityById } = useActivities();
    const { getUserById } = useUsers();
    const { sendMessage } = useChats();

    const activity = getActivityById(chat.activityId);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [chat.messages]);

    if (!activity || !currentUser) return <div>Activity not found</div>;


    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newMessage.trim() || !currentUser || isSending) return;
        
        setIsSending(true);
        try {
            await sendMessage(chat.activityId, newMessage);
            setNewMessage('');
        } catch(error) {
            console.error("Failed to send message", error);
            // Optionally show a toast to the user
        } finally {
            setIsSending(false);
        }
    };
    
    const isParticipant = activity.participants.includes(currentUser.id);

    return (
        <div className="flex flex-col h-full bg-light-bg-secondary dark:bg-dark-bg-secondary border-l border-light-border dark:border-dark-border">
            <header className="p-4 border-b border-light-border dark:border-dark-border flex items-center flex-shrink-0">
                 <button onClick={onBack} className="lg:hidden mr-4 p-2 -ml-2">&larr;</button>
                 <h2 className="font-bold text-lg">{activity.title}</h2>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chat.messages.map(message => {
                    if (message.isSystemMessage) {
                        return (
                            <div key={message.id} className="text-center text-xs text-light-text-secondary dark:text-dark-text-secondary italic my-2">
                                {message.text}
                            </div>
                        )
                    }
                    const sender = getUserById(message.senderId!);
                    const isCurrentUser = message.senderId === currentUser.id;
                    return (
                        <div key={message.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-primary text-white' : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border'}`}>
                                {!isCurrentUser && <p className="text-xs font-bold mb-1 text-primary">{sender?.name}</p>}
                                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                                <div className={`flex items-center gap-1.5 text-xs mt-1 ${isCurrentUser ? 'justify-end opacity-70' : 'justify-start opacity-50'}`}>
                                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isCurrentUser && message.status === 'pending' && <ClockIcon />}
                                    {isCurrentUser && message.status === 'failed' && <ErrorIcon />}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
            {isParticipant ? (
                <footer className="p-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input 
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary rounded-md"
                            disabled={isSending}
                        />
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold transition-colors hover:bg-primary-dark rounded-md disabled:bg-gray-400" disabled={isSending}>
                           {isSending ? '...' : 'Send'}
                        </button>
                    </form>
                </footer>
            ) : (
                <footer className="p-4 border-t border-light-border dark:border-dark-border flex-shrink-0 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary bg-light-bg dark:bg-dark-bg">
                    <p>You have left this activity. You can no longer send messages.</p>
                </footer>
            )}
        </div>
    );
};
