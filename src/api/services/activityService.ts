import { db } from '../mockDatabase';
// FIX: Add `Sport` to imports to support the explicit return type on `getSports`.
import { Activity, Sport } from '../../shared/types';

const SIMULATED_DELAY = 500;

export const activityService = {
  getActivities: async (): Promise<Activity[]> => {
    console.log('API: Fetching all activities...');
    return new Promise(resolve => setTimeout(() => resolve([...db.activities]), SIMULATED_DELAY));
  },

  createActivity: async (newActivityData: Omit<Activity, 'id' | 'creatorId' | 'participants'>, creatorId: string): Promise<Activity> => {
    console.log('API: Creating activity...');
    const newActivity: Activity = {
      ...newActivityData,
      id: `activity-${Date.now()}`,
      creatorId: creatorId,
      participants: [creatorId],
    };
    db.activities = [newActivity, ...db.activities];
    return new Promise(resolve => setTimeout(() => resolve(newActivity), SIMULATED_DELAY));
  },

  joinActivity: async (activityId: string, userId: string): Promise<Activity> => {
    console.log(`API: User ${userId} joining activity ${activityId}...`);
    let updatedActivity: Activity | undefined;
    db.activities = db.activities.map(activity => {
      if (activity.id === activityId && !activity.participants.includes(userId)) {
        updatedActivity = { ...activity, participants: [...activity.participants, userId] };
        return updatedActivity;
      }
      return activity;
    });

    if (updatedActivity) {
      return new Promise(resolve => setTimeout(() => resolve(updatedActivity!), SIMULATED_DELAY));
    } else {
      return Promise.reject(new Error('Activity not found or user already joined.'));
    }
  },

  leaveActivity: async (activityId: string, userId: string): Promise<Activity> => {
    console.log(`API: User ${userId} leaving activity ${activityId}...`);
    let updatedActivity: Activity | undefined;
    db.activities = db.activities.map(activity => {
      if (activity.id === activityId) {
        updatedActivity = { ...activity, participants: activity.participants.filter(pId => pId !== userId) };
        return updatedActivity;
      }
      return activity;
    });

    if (updatedActivity) {
      return new Promise(resolve => setTimeout(() => resolve(updatedActivity!), SIMULATED_DELAY));
    } else {
      return Promise.reject(new Error('Activity not found.'));
    }
  },

  deleteActivity: async (activityId: string): Promise<string> => {
    console.log(`API: Deleting activity ${activityId}...`);
    const initialLength = db.activities.length;
    db.activities = db.activities.filter(activity => activity.id !== activityId);
    // Also delete associated chats
    db.chats = db.chats.filter(chat => chat.activityId !== activityId);
    
    if (db.activities.length < initialLength) {
      return new Promise(resolve => setTimeout(() => resolve(activityId), SIMULATED_DELAY));
    } else {
      return Promise.reject(new Error('Activity not found.'));
    }
  },
  
  // FIX: Add explicit return type `Promise<Sport[]>` to ensure correct type inference where this function is used.
  getSports: async (): Promise<Sport[]> => {
    console.log('API: Fetching all sports...');
    return new Promise(resolve => setTimeout(() => resolve([...db.sports]), SIMULATED_DELAY));
  }
};
