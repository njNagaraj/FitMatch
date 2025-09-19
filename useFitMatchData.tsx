import { useState, useMemo } from 'react';
import { Activity, User, Sport, Event, Chat, Message, Toast } from './types';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [locationPreference, setLocationPreference] = useState<'current' | 'home'>('current');


  const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);

  const nearbyActivities = useMemo(() => {
    if (!currentUser) return [];
    
    const searchLocation = 
        locationPreference === 'home' && currentUser.homeLocation 
        ? currentUser.homeLocation 
        : currentUser.currentLocation;
        
    if (!searchLocation) return [];

    return activities.filter(activity => {
      const distance = haversineDistance(searchLocation, activity.locationCoords);
      return distance <= VIEW_RADIUS_KM && !activity.participants.includes(currentUser.id);
    });
  }, [activities, currentUser, locationPreference]);

  const myActivities = useMemo(() => {
      if(!currentUser) return [];
      return activities.filter(a => a.creatorId === currentUser.id || a.participants.includes(currentUser.id)).sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime());
  }, [activities, currentUser]);
  
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000); // Auto-dismiss after 5 seconds
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const joinActivity = (activityId: string) => {
    if (!currentUser) return;
    
    const activity = activities.find(a => a.id === activityId);

    // Check if activity exists and user is not already a participant
    if (!activity || activity.participants.includes(currentUser.id)) {
        return;
    }

    const newParticipants = [...activity.participants, currentUser.id];
    const shouldCreateChat = newParticipants.length >= 2 && !chats.some(c => c.activityId === activityId);

    // Update activities state
    setActivities(prev =>
        prev.map(act =>
            act.id === activityId
                ? { ...act, participants: newParticipants }
                : act
        )
    );

    // Update chats state if needed
    if (shouldCreateChat) {
        const newChat: Chat = {
            id: activityId,
            activityId: activityId,
            messages: [
                {
                    id: `msg-${Date.now()}`,
                    senderId: 'system',
                    text: `${currentUser.name} has joined the activity!`,
                    timestamp: new Date(),
                },
            ],
        };
        setChats(prevChats => [...prevChats, newChat]);
    }

    addToast(`Successfully joined "${activity.title}"!`, 'success');
  };

  const leaveActivity = (activityId: string) => {
      if (!currentUser) return;
      const activity = activities.find(a => a.id === activityId);
      if(activity) {
        setActivities(prev => prev.map(activity => {
            if (activity.id === activityId) {
                return { ...activity, participants: activity.participants.filter(pId => pId !== currentUser.id) };
            }
            return activity;
        }));
        addToast(`You have left "${activity.title}".`, 'info');
      }
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
      addToast('Activity created successfully!', 'success');
  };
  
  const deleteActivity = (activityId: string) => {
    const activityToDelete = activities.find(a => a.id === activityId);
    if(activityToDelete) {
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      setChats(prev => prev.filter(chat => chat.activityId !== activityId));
      addToast(`Activity "${activityToDelete.title}" deleted.`, 'info');
    }
  };

  const deleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    // 1. Remove activities created by the user
    const activitiesToDelete = activities.filter(a => a.creatorId === userId).map(a => a.id);
    setActivities(prev => prev.filter(a => a.creatorId !== userId));
    setChats(prev => prev.filter(c => !activitiesToDelete.includes(c.activityId)));

    // 2. Remove user from participants list of other activities
    setActivities(prev => prev.map(activity => ({
      ...activity,
      participants: activity.participants.filter(pId => pId !== userId)
    })));

    // 3. Remove the user
    setUsers(prev => prev.filter(u => u.id !== userId));
    addToast(`User "${userToDelete.name}" has been deleted.`, 'info');
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

  const updateUserProfile = (updatedData: Partial<Pick<User, 'name' | 'homeLocation'>>) => {
    if (!currentUser) return;
    setUsers(prevUsers => prevUsers.map(user => 
        user.id === currentUserId 
        ? { ...user, ...updatedData }
        : user
    ));
    addToast('Profile updated successfully!', 'success');
  };

  const updateCurrentUserLocation = (coords: { lat: number; lon: number }) => {
    if (!currentUserId) return;
    setUsers(prevUsers => prevUsers.map(user =>
        user.id === currentUserId
        ? { ...user, currentLocation: coords }
        : user
    ));
  };

  const login = (email: string, password: string):boolean => {
    // Define credentials here since they aren't in the user model
    const userCredentials: { [email: string]: string } = {
        'admin@fitmatch.com': 'admin123',
        'nagaraj@fitmatch.com': 'password123',
        'priya@fitmatch.com': 'password123',
        'sam@fitmatch.com': 'password123',
    };

    const userToLogin = users.find(u => u.email === email);

    if (userToLogin && userCredentials[email] === password) {
        setCurrentUserId(userToLogin.id);
        setIsAuthenticated(true);
        setIsAdmin(!!userToLogin.isAdmin);
        return true;
    }

    return false;
  };

  const signup = (name: string, email: string, password: string):boolean => {
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: name,
        email: email,
        avatarUrl: `https://i.pravatar.cc/150?u=${name}`,
        currentLocation: { lat: 13.0471, lon: 80.1873 }, // Default to Chennai
        isAdmin: false
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    setIsAdmin(false);
    return true;
  };
  
  const logout = () => {
      setIsAuthenticated(false);
      setCurrentUserId(null);
      setIsAdmin(false);
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
    isAdmin,
    nearbyActivities,
    myActivities,
    locationPreference,
    setLocationPreference,
    joinActivity,
    leaveActivity,
    createActivity,
    deleteActivity,
    deleteUser,
    sendMessage,
    updateUserProfile,
    updateCurrentUserLocation,
    getUserById,
    getSportById,
    getActivityById,
    login,
    signup,
    logout,
    toasts,
    addToast,
    removeToast,
  };
};

export type FitMatchData = ReturnType<typeof useFitMatchData>;