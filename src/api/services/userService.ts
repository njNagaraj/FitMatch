import { db } from '../mockDatabase';
import { User } from '../../shared/types';

const SIMULATED_DELAY = 500;

export const userService = {
  getUsers: async (): Promise<User[]> => {
    console.log('API: Fetching all users...');
    return new Promise(resolve => setTimeout(() => resolve([...db.users]), SIMULATED_DELAY));
  },

  updateUserProfile: async (userId: string, updatedData: Partial<Pick<User, 'name' | 'homeLocation'>>): Promise<User> => {
    console.log(`API: Updating profile for user ${userId}...`);
    let updatedUser: User | undefined;
    db.users = db.users.map(user => {
      if (user.id === userId) {
        updatedUser = { ...user, ...updatedData };
        return updatedUser;
      }
      return user;
    });

    if (updatedUser) {
      return new Promise(resolve => setTimeout(() => resolve(updatedUser!), SIMULATED_DELAY));
    } else {
      return Promise.reject(new Error('User not found.'));
    }
  },

  updateCurrentUserLocation: async (userId: string, coords: { lat: number; lon: number }): Promise<User> => {
      console.log(`API: Updating current location for user ${userId}...`);
      let updatedUser: User | undefined;
      db.users = db.users.map(user => {
          if (user.id === userId) {
              updatedUser = { ...user, currentLocation: coords };
              return updatedUser;
          }
          return user;
      });
      if (updatedUser) {
        return new Promise(resolve => setTimeout(() => resolve(updatedUser!), 50)); // Quicker update
      } else {
        return Promise.reject(new Error('User not found.'));
      }
  },

  deleteUser: async (userId: string): Promise<string> => {
    console.log(`API: Deleting user ${userId}...`);
    
    // 1. Remove activities created by the user and their associated chats
    const activitiesToDelete = db.activities.filter(a => a.creatorId === userId).map(a => a.id);
    db.activities = db.activities.filter(a => a.creatorId !== userId);
    db.chats = db.chats.filter(c => !activitiesToDelete.includes(c.activityId));

    // 2. Remove user from participants list of other activities
    db.activities = db.activities.map(activity => ({
      ...activity,
      participants: activity.participants.filter(pId => pId !== userId)
    }));

    // 3. Remove the user
    const initialUserCount = db.users.length;
    db.users = db.users.filter(u => u.id !== userId);
    
    if(db.users.length < initialUserCount) {
        return new Promise(resolve => setTimeout(() => resolve(userId), SIMULATED_DELAY));
    } else {
        return Promise.reject(new Error('User not found'));
    }
  },
};
