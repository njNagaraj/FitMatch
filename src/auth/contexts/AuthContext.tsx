import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../../shared/types';
import { authService } from '../../api/services/authService';
import { userService } from '../../api/services/userService';
import { useToast } from '../../shared/contexts/ToastContext';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (updatedData: Partial<Pick<User, 'name' | 'homeLocation'>>) => Promise<void>;
  updateCurrentUserLocation: (coords: { lat: number; lon: number }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const checkUserSession = useCallback(async () => {
    try {
      setLoading(true);
      const user = await authService.checkSession();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to check session:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);
  
  // Effect to get user's live location
  useEffect(() => {
    if (currentUser) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    updateCurrentUserLocation({ lat: latitude, lon: longitude });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    addToast("Could not get location. Using last known.", "error");
                }
            );
        } else {
            addToast("Geolocation is not supported by this browser.", "error");
        }
    }
  }, [currentUser, addToast]);


  const login = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const user = await authService.signup(name, email, password);
      setCurrentUser(user);
      // In a real app, you might get a specific flag from the API
      // For now, we assume a new signup always starts the tour.
      localStorage.removeItem('fitmatch_hasCompletedTour'); 
      return true;
    } catch (error: any) {
      addToast(error.message, 'error');
      return false;
    }
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const updateUserProfile = async (updatedData: Partial<Pick<User, 'name' | 'homeLocation'>>) => {
      if (!currentUser) return;
      try {
          const updatedUser = await userService.updateUserProfile(currentUser.id, updatedData);
          setCurrentUser(updatedUser);
          addToast('Profile updated successfully!', 'success');
      } catch (error) {
          addToast('Failed to update profile.', 'error');
      }
  };
  
  const updateCurrentUserLocation = async (coords: { lat: number; lon: number }) => {
      if(!currentUser) return;
      try {
          const updatedUser = await userService.updateCurrentUserLocation(currentUser.id, coords);
          setCurrentUser(updatedUser);
      } catch (error) {
          console.error("Failed to update user location", error);
      }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.isAdmin || false,
    loading,
    login,
    signup,
    logout,
    updateUserProfile,
    updateCurrentUserLocation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
