import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../shared/types';
import { authService } from '../../api/services/authService';
import { userService } from '../../api/services/userService';
import { useToast } from '../../shared/contexts/ToastContext';
import { supabase } from '../../api/supabaseClient';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (updatedData: Partial<Pick<User, 'name' | 'homeLocation' | 'viewRadius'>>) => Promise<void>;
  updateCurrentUserLocation: (coords: { lat: number; lon: number }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // This useEffect hook handles the initial session check and subsequent auth state changes.
  useEffect(() => {
    // Function to check for an active session on initial load.
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const profile = await userService.getUserProfile(session.user.id);
          if (profile) {
            const user: User = { id: session.user.id, email: session.user.email, ...profile };
            const storedLocation = localStorage.getItem(`fitmatch_currentLocation_${user.id}`);
            user.currentLocation = storedLocation ? JSON.parse(storedLocation) : { lat: 13.0471, lon: 80.1873 };
            setCurrentUser(user);
          } else {
            console.error("User session exists but no profile found. Logging out.");
            await supabase.auth.signOut();
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error fetching profile on initial load:", error);
          setCurrentUser(null);
        }
      }
      // Crucially, set loading to false after the initial check is complete.
      setLoading(false);
    };

    checkUserSession();

    // Set up a listener for real-time auth changes (e.g., login, logout).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // A user has logged in or the session was refreshed. Fetch their profile.
        const profile = await userService.getUserProfile(session.user.id);
        if (profile) {
          setCurrentUser({ id: session.user.id, email: session.user.email, ...profile });
        } else {
          // This is an edge case where a user exists in auth but not in profiles.
          setCurrentUser(null);
        }
      } else {
        // The user has logged out.
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Effect to get and update user's live location
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
                    addToast("Could not get fresh location. Using last known.", "info");
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            addToast("Geolocation is not supported by this browser.", "error");
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, addToast]);


  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      sessionStorage.removeItem('start_tour');
      return true;
    } catch (error: any) {
      console.error(error);
      addToast(error.message, 'error');
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await authService.signup(name, email, password);
      sessionStorage.setItem('start_tour', 'true');
      return true;
    } catch (error: any) {
      addToast(error.message, 'error');
      return false;
    }
  };

  const logout = async () => {
    if (currentUser) {
        localStorage.removeItem(`fitmatch_currentLocation_${currentUser.id}`);
    }
    try {
        await authService.logout();
        sessionStorage.removeItem('start_tour');
    } catch (err) {
        console.error("Logout failed: ", err);
        addToast("Logout failed. Please try again.", "error");
    }
  };

  const updateUserProfile = async (updatedData: Partial<Pick<User, 'name' | 'homeLocation' | 'viewRadius'>>) => {
      if (!currentUser) return;
      try {
          const updatedProfile = await userService.updateUserProfile(currentUser.id, updatedData);
          setCurrentUser(prevUser => prevUser ? { ...prevUser, ...updatedProfile } : null);
          addToast('Profile updated successfully!', 'success');
      } catch (error) {
          addToast('Failed to update profile.', 'error');
      }
  };
  
  const updateCurrentUserLocation = (coords: { lat: number; lon: number }) => {
      if(!currentUser) return;
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, currentLocation: coords };
        localStorage.setItem(`fitmatch_currentLocation_${prevUser.id}`, JSON.stringify(coords));
        return updatedUser;
      });
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