import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Activity, Sport } from '../../../shared/types';
import { activityService } from '../../../api/services/activityService';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useToast } from '../../../shared/contexts/ToastContext';
import { DEFAULT_VIEW_RADIUS_KM } from '../../../shared/constants';
import { haversineDistance } from '../../../shared/utils/geolocation';

type ActivityData = Omit<Activity, 'id' | 'creatorId' | 'participants'>;

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
  createActivity: (newActivity: ActivityData) => Promise<boolean>;
  updateActivity: (activityId: string, updatedData: Partial<ActivityData>) => Promise<boolean>;
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
    } catch (error: any) {
      console.error("Failed to fetch activity data:", error);
      addToast(error.message, "error");
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
      .filter(a => a.participants.includes(currentUser.id))
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [activities, currentUser]);

  const nearbyActivities = useMemo(() => {
    if (!currentUser) return [];
    
    const searchLocation = locationPreference === 'home' && currentUser.homeLocation 
      ? currentUser.homeLocation 
      : currentUser.currentLocation;
        
    if (!searchLocation) return [];

    const radius = currentUser.viewRadius || DEFAULT_VIEW_RADIUS_KM;

    return activities.filter(activity => {
      const distance = haversineDistance(searchLocation, activity.locationCoords);
      return distance <= radius && !activity.participants.includes(currentUser.id);
    });
  }, [activities, currentUser, locationPreference]);
  
  const getSportById = (id: string) => sports.find(s => s.id === id);
  const getActivityById = (id: string) => activities.find(a => a.id === id);

  const createActivity = async (newActivityData: ActivityData) => {
    if (!currentUser) return false;
    try {
      const newActivity = await activityService.createActivity(newActivityData, currentUser.id);
      setActivities(prev => [newActivity, ...prev]);
      addToast('Activity created successfully!', 'success');
      return true;
    } catch (error: any) {
      addToast(error.message, 'error');
      return false;
    }
  };
  
  const updateActivity = async (activityId: string, updatedData: Partial<ActivityData>) => {
    try {
      const updatedActivity = await activityService.updateActivity(activityId, updatedData);
      setActivities(prev => prev.map(a => a.id === activityId ? updatedActivity : a));
      addToast('Activity updated successfully!', 'success');
      return true;
    } catch (error: any) {
      addToast(error.message, 'error');
      return false;
    }
  };

  const joinActivity = async (activityId: string) => {
    if (!currentUser) return;
    const activity = getActivityById(activityId);
    if (!activity) return;

    try {
      await activityService.joinActivity(activityId, currentUser.id);
      // Optimistically update UI
      setActivities(prev => prev.map(a => 
          a.id === activityId 
          ? { ...a, participants: [...a.participants, currentUser.id] } 
          : a
      ));
      addToast(`Successfully joined "${activity.title}"!`, 'success');
      // The database trigger will now handle creating the system message.
    } catch (error: any) {
      addToast(error.message, 'error');
    }
  };

  const leaveActivity = async (activityId: string) => {
    if (!currentUser) return;
    const activity = getActivityById(activityId);
    if (!activity) return;

    try {
      await activityService.leaveActivity(activityId, currentUser.id);
      // Optimistically update UI
      setActivities(prev => prev.map(a => 
          a.id === activityId 
          ? { ...a, participants: a.participants.filter(pId => pId !== currentUser.id) } 
          : a
      ));
      addToast(`You have left "${activity.title}".`, 'info');
       // The database trigger will now handle creating the system message.
    } catch (error: any) {
      addToast(error.message, 'error');
    }
  };
  
  const deleteActivity = async (activityId: string) => {
    const activity = getActivityById(activityId);
    if (!activity) return;
    try {
      await activityService.deleteActivity(activityId);
      setActivities(prev => prev.filter(a => a.id !== activityId));
      addToast(`Activity "${activity.title}" deleted.`, 'info');
    } catch (error: any) {
      addToast(error.message, 'error');
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
    updateActivity,
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