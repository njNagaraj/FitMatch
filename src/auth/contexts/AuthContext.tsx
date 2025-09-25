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
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updatedData: Partial<Pick<User, 'name' | 'homeLocation' | 'viewRadius'>>) => Promise<void>;
  updateCurrentUserLocation: (coords: { lat: number; lon: number }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // --- Initial session check & auth state listener ---
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session?.user) {

          // Show app immediately with minimal user info
          setCurrentUser({ id: session.user.id, email: session.user.email, name: "Loading...", isAdmin: false });

          // Fetch profile in background
          userService.getUserProfile(session.user.id)
            .then(profile => {
              if (profile) {
                setCurrentUser(prev => ({ ...prev, ...profile }));
              } else {
                console.warn("[AuthProvider] Profile missing, keeping minimal user info");
              }
            })
            .catch(err => console.error("[AuthProvider] Profile fetch failed:", err));
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("[AuthProvider] Error in checkUserSession:", err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();

    // Listen for auth state changes (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {

      if (session?.user) {
        // Immediately set minimal user
        setCurrentUser({ id: session.user.id, email: session.user.email, name: "Loading...", isAdmin: false });

        // Fetch profile asynchronously
        userService.getUserProfile(session.user.id)
          .then(profile => {
            if (profile) setCurrentUser(prev => ({ ...prev, ...profile }));
          })
          .catch(err => console.error("[AuthProvider] Profile fetch failed on auth change:", err));
      } else {
        setCurrentUser(null);
      }

      setLoading(false); // Ensure loader removed
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // --- Update current user location ---
  useEffect(() => {
    if (currentUser) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            updateCurrentUserLocation({ lat: latitude, lon: longitude });
          },
          error => {
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
  }, [currentUser?.id]);

  // --- Auth actions ---
  const login = async (email: string, password: string) => {
    await authService.login(email, password);
    sessionStorage.removeItem('start_tour');
  };

  const signup = async (name: string, email: string, password: string) => {
    await authService.signup(name, email, password);
    sessionStorage.setItem('start_tour', 'true');
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
    if (!currentUser) return;
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, currentLocation: coords };
      localStorage.setItem(`fitmatch_currentLocation_${prevUser.id}`, JSON.stringify(coords));
      return updatedUser;
    });
  };

  const value: AuthContextType = {
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};