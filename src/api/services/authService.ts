import { db } from '../mockDatabase';
import { User } from '../../shared/types';

const SIMULATED_DELAY = 500;

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    console.log(`API: Attempting login for ${email}...`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = db.users.find(u => u.email === email);
        if (user && db.userCredentials[email as keyof typeof db.userCredentials] === password) {
          localStorage.setItem('fitmatch_userId', user.id);
          resolve(user);
        } else {
          reject(new Error('Invalid email or password.'));
        }
      }, SIMULATED_DELAY);
    });
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    console.log(`API: Attempting signup for ${email}...`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (db.users.some(u => u.email === email)) {
          return reject(new Error('An account with this email already exists.'));
        }

        const newUser: User = {
          id: `user-${Date.now()}`,
          name: name,
          email: email,
          avatarUrl: `https://i.pravatar.cc/150?u=${name}`,
          currentLocation: { lat: 13.0471, lon: 80.1873 }, // Default to Chennai
          isAdmin: false
        };

        db.users.push(newUser);
        db.userCredentials = { ...db.userCredentials, [email]: password };
        localStorage.setItem('fitmatch_userId', newUser.id);
        resolve(newUser);
      }, SIMULATED_DELAY);
    });
  },

  logout: async (): Promise<void> => {
    console.log('API: Logging out...');
    localStorage.removeItem('fitmatch_userId');
    return Promise.resolve();
  },

  checkSession: async (): Promise<User | null> => {
    console.log('API: Checking session...');
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedUserId = localStorage.getItem('fitmatch_userId');
        if (storedUserId) {
          const user = db.users.find(u => u.id === storedUserId);
          resolve(user || null);
        } else {
          resolve(null);
        }
      }, 200); // Faster session check
    });
  },
};
