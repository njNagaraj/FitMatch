import { useState, useMemo } from 'react';
import { Activity, User, Sport, Event, Chat, Message } from './types';
import { MOCK_ACTIVITIES, MOCK_USERS, MOCK_SPORTS, MOCK_EVENTS, MOCK_CHATS } from './data';
import { VIEW_RADIUS_KM } from './constants';

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
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);

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
    if (!currentUser) return;
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId && !activity.participants.includes(currentUser.id)) {
        const newParticipants = [...activity.participants, currentUser.id];
        
        if (newParticipants.length >= 2 && !chats.some(c => c.activityId === activityId)) {
            const newChat: Chat = {
                id: activityId,
                activityId: activityId,
                messages: [{
                    id: `msg-${Date.now()}`,
                    senderId: currentUser.id,
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
      if (!currentUser) return;
      setActivities(prev => prev.map(activity => {
          if (activity.id === activityId) {
              return { ...activity, participants: activity.participants.filter(pId => pId !== currentUser.id) };
          }
          return activity;
      }));
  };
  
  const createActivity = (newActivity: Omit<Activity, 'id' | 'creatorId' | 'participants'>) => {
      if (!currentUser) return;
      const activity: Activity = {
          ...newActivity,
          id: `activity-${Date.now()}`,
          creatorId: currentUser.id,
          participants: [currentUser.id],
      };
      setActivities(prev => [activity, ...prev]);
  };
  
  const deleteActivity = (activityId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
    setChats(prev => prev.filter(chat => chat.activityId !== activityId));
  };

  const sendMessage = (activityId: string, text: string) => {
    if (!text.trim() || !currentUser) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
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

  const login = (email: string, password: string):boolean => {
    // Mock login logic
    if (email === 'user@fitmatch.com' && password === 'password123') {
        const userToLogin = MOCK_USERS[0];
        setCurrentUserId(userToLogin.id);
        setIsAuthenticated(true);
        return true;
    }
    return false;
  };

  const signup = (name: string, email: string, password: string):boolean => {
    // Mock signup logic
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: name,
        avatarUrl: `https://i.pravatar.cc/150?u=${name}`,
        location: { lat: 12.9716, lon: 77.5946 } // Default to Bangalore
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    return true;
  };
  
  const logout = () => {
      setIsAuthenticated(false);
      setCurrentUserId(null);
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
    isAuthenticated,
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
    login,
    signup,
    logout,
  };
};

export type FitMatchData = ReturnType<typeof useFitMatchData>;