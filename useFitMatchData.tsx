import { useState, useMemo } from 'react';
import { Activity, User, Sport, Event, Chat, Message } from './types';
import { MOCK_ACTIVITIES, MOCK_USERS, MOCK_SPORTS, MOCK_EVENTS, MOCK_CHATS } from './data';
import { CURRENT_USER_ID, VIEW_RADIUS_KM } from './constants';

// Haversine formula to calculate distance between two lat/lon points in km
const haversineDistance = (
  coords1: { lat: number; lon: number },
  coords2: { lat: number; lon: number }
) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lon - coords1.lon);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


export const useFitMatchData = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [sports, setSports] = useState<Sport[]>(MOCK_SPORTS);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);

  const currentUser = useMemo(() => users.find(u => u.id === CURRENT_USER_ID)!, [users]);

  const nearbyActivities = useMemo(() => {
    if (!currentUser) return [];
    return activities.filter(activity => {
      const distance = haversineDistance(currentUser.location, activity.locationCoords);
      return distance <= VIEW_RADIUS_KM && activity.creatorId !== currentUser.id;
    });
  }, [activities, currentUser]);

  const myActivities = useMemo(() => {
      if(!currentUser) return [];
      return activities.filter(a => a.creatorId === currentUser.id || a.participants.includes(currentUser.id)).sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime());
  }, [activities, currentUser]);
  
  const joinActivity = (activityId: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId && !activity.participants.includes(CURRENT_USER_ID)) {
        const newParticipants = [...activity.participants, CURRENT_USER_ID];
        
        // Create a chat if one doesn't exist and there are now at least 2 people
        if (newParticipants.length >= 2 && !chats.some(c => c.activityId === activityId)) {
            const newChat: Chat = {
                id: activityId,
                activityId: activityId,
                messages: [{
                    id: `msg-${Date.now()}`,
                    senderId: CURRENT_USER_ID,
                    text: `${currentUser.name} has joined the activity!`,
                    timestamp: new Date(),
                }]
            };
            setChats(prevChats => [...prevChats, newChat]);
        }
        
        return { ...activity, participants: newParticipants };
      }
      return activity;
    }));
  };

  const leaveActivity = (activityId: string) => {
      setActivities(prev => prev.map(activity => {
          if (activity.id === activityId) {
              return { ...activity, participants: activity.participants.filter(pId => pId !== CURRENT_USER_ID) };
          }
          return activity;
      }));
  };
  
  const createActivity = (newActivity: Omit<Activity, 'id' | 'creatorId' | 'participants'>) => {
      const activity: Activity = {
          ...newActivity,
          id: `activity-${Date.now()}`,
          creatorId: CURRENT_USER_ID,
          participants: [CURRENT_USER_ID],
      };
      setActivities(prev => [activity, ...prev]);
  };
  
  const deleteActivity = (activityId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
    // Also remove associated chat
    setChats(prev => prev.filter(chat => chat.activityId !== activityId));
  };

  const sendMessage = (activityId: string, text: string) => {
    if (!text.trim()) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: CURRENT_USER_ID,
      text,
      timestamp: new Date(),
    };
    
    setChats(prev => prev.map(chat => {
      if (chat.activityId === activityId) {
        return { ...chat, messages: [...chat.messages, newMessage] };
      }
      return chat;
    }));
  };

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getSportById = (id: string) => sports.find(s => s.id === id);
  const getActivityById = (id: string) => activities.find(a => a.id === id);
  
  return {
    users,
    sports,
    activities,
    events,
    chats,
    currentUser,
    nearbyActivities,
    myActivities,
    joinActivity,
    leaveActivity,
    createActivity,
    deleteActivity,
    sendMessage,
    getUserById,
    getSportById,
    getActivityById,
  };
};

export type FitMatchData = ReturnType<typeof useFitMatchData>;