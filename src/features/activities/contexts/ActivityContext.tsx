import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Activity, Sport } from '../../../shared/types';
import { activityService } from '../../../api/services/activityService';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useToast } from '../../../shared/contexts/ToastContext';
import { VIEW_RADIUS_KM } from '../../../shared/constants';
import { haversineDistance } from '../../../shared/utils/geolocation';
import { useChats } from '../../chats/contexts/ChatContext';

interface ActivityContextType {
  activities: Activity[];
  sports: Sport[];
  myActivities: Activity[];
  nearbyActivities: Activity[];
  loading: boolean;
  locationPreference: 'current' | 'home';
  setLocationPreference: (preference: 'current' | 'home') => void;
  getSportById: (id: string) => Sport | undefined;
  getActivityById: (id: string) => Activity | undefined;
  createActivity: (newActivity: Omit<Activity, 'id' | 'creatorId' | 'participants'>) => Promise<boolean>;
  joinActivity: (activityId: string) => Promise<void>;
  leaveActivity: (activityId: string) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationPreference, setLocationPreference] = useState<'current' | 'home'>('current');

  const { currentUser, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { createChatForActivity, addSystemMessageToChat } = useChats();

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [fetchedActivities, fetchedSports] = await Promise.all([
        activityService.getActivities(),
        activityService.getSports(),
      ]);
      setActivities(fetchedActivities);
      setSports(fetchedSports);
    } catch (error) {
      console.error("Failed to fetch activity data:", error);
      addToast("Could not load activities.", "error");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const myActivities = useMemo(() => {
    if (!currentUser) return [];
    return activities
      .filter(a => a.creatorId === currentUser.id || a.participants.includes(currentUser.id))
      .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
  }, [activities, currentUser]);

  const nearbyActivities = useMemo(() => {
    if (!currentUser) return [];
    
    const searchLocation = locationPreference === 'home' && currentUser.homeLocation 
      ? currentUser.homeLocation 
      : currentUser.currentLocation;
        
    if (!searchLocation) return [];

    return activities.filter(activity => {
      const distance = haversineDistance(searchLocation, activity.locationCoords);
      return distance <= VIEW_RADIUS_KM && !activity.participants.includes(currentUser.id);
    });
  }, [activities, currentUser, locationPreference]);
  
  const getSportById = (id: string) => sports.find(s => s.id === id);
  const getActivityById = (id: string) => activities.find(a => a.id === id);

  const createActivity = async (newActivityData: Omit<Activity, 'id' | 'creatorId' | 'participants'>) => {
    if (!currentUser) return false;
    try {
      const newActivity = await activityService.createActivity(newActivityData, currentUser.id);
      setActivities(prev => [newActivity, ...prev]);
      addToast('Activity created successfully!', 'success');
      return true;
    } catch (error) {
      addToast('Failed to create activity.', 'error');
      return false;
    }
  };

  const joinActivity = async (activityId: string) => {
    if (!currentUser) return;
    const activity = getActivityById(activityId);
    if (!activity) return;

    try {
      const updatedActivity = await activityService.joinActivity(activityId, currentUser.id);
      setActivities(prev => prev.map(a => a.id === activityId ? updatedActivity : a));
      addToast(`Successfully joined "${activity.title}"!`, 'success');
      
      // Handle chat creation/update
      if (updatedActivity.participants.length >= 2) {
          const message = `${currentUser.name} has joined the activity!`;
          const chatExists = addSystemMessageToChat(activityId, message);
          if(!chatExists) {
              createChatForActivity(activityId, message);
          }
      }
    } catch (error) {
      addToast('Failed to join activity.', 'error');
    }
  };

  const leaveActivity = async (activityId: string) => {
    if (!currentUser) return;
    const activity = getActivityById(activityId);
    if (!activity) return;

    try {
      await activityService.leaveActivity(activityId, currentUser.id);
      setActivities(prev => prev.map(a => 
        a.id === activityId 
        ? { ...a, participants: a.participants.filter(pId => pId !== currentUser.id) }
        : a
      ));
      addToast(`You have left "${activity.title}".`, 'info');
    } catch (error) {
      addToast('Failed to leave activity.', 'error');
    }
  };
  
  const deleteActivity = async (activityId: string) => {
    const activity = getActivityById(activityId);
    if (!activity) return;
    try {
      await activityService.deleteActivity(activityId);
      setActivities(prev => prev.filter(a => a.id !== activityId));
      addToast(`Activity "${activity.title}" deleted.`, 'info');
    } catch (error) {
      addToast('Failed to delete activity.', 'error');
    }
  };

  const value = {
    activities,
    sports,
    myActivities,
    nearbyActivities,
    loading,
    locationPreference,
    setLocationPreference,
    getSportById,
    getActivityById,
    createActivity,
    joinActivity,
    leaveActivity,
    deleteActivity,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

export const useActivities = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
};
