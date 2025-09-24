import React, { useState, useEffect } from 'react';
import { Page, Activity } from './shared/types';
import { Login } from './auth/components/Login';
import { Signup } from './auth/components/Signup';
import { ToastContainer } from './shared/components/Toast';
import { OnboardingTour } from './features/onboarding/components/OnboardingTour';
import { MainLayout } from './shared/components/MainLayout';
import { NotificationHandler } from './shared/components/NotificationHandler';

import { AuthProvider, useAuth } from './auth/contexts/AuthContext';
import { ActivityProvider } from './features/activities/contexts/ActivityContext';
import { EventProvider } from './features/events/contexts/EventContext';
import { ChatProvider } from './features/chats/contexts/ChatContext';
import { UserProvider } from './features/users/contexts/UserContext';
import { ToastProvider, useToast } from './shared/contexts/ToastContext';
import { TourProvider, useTour } from './features/onboarding/contexts/TourContext';
import { ICONS } from './shared/constants';

// The main App component is now the provider wrapper
const App = () => {
    return (
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <ChatProvider>
              <ActivityProvider>
                <EventProvider>
                  <TourProvider>
                    <AppContent />
                  </TourProvider>
                </EventProvider>
              </ActivityProvider>
            </ChatProvider>
          </UserProvider>
        </AuthProvider>
      </ToastProvider>
    );
};

// This component contains the main application logic
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
      }
    }
    return 'light';
  });

  const { isAuthenticated, loading, isAdmin } = useAuth();
  const { toasts, removeToast } = useToast();
  const { isTourOpen } = useTour();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);
  
  // When user logs in or out, set the correct default page
  useEffect(() => {
    if (isAuthenticated) {
        if (isAdmin) {
            setCurrentPage(Page.AdminDashboard);
        } else {
            setCurrentPage(Page.Home);
        }
    }
  }, [isAuthenticated, isAdmin]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
            <div className="flex items-center space-x-3">
                {ICONS.logo}
                <p className="text-xl font-semibold">Loading FitMatch...</p>
            </div>
        </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
         <MainLayout 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            activityToEdit={activityToEdit}
            setActivityToEdit={setActivityToEdit}
            theme={theme}
            toggleTheme={toggleTheme}
        />
      ) : (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen font-sans text-light-text dark:text-dark-text">
            {authPage === 'login' ? (
                <Login setAuthPage={setAuthPage} />
            ) : (
                <Signup setAuthPage={setAuthPage} />
            )}
        </div>
      )}

      {/* These components are rendered on top of the main layout */}
      {isTourOpen && <OnboardingTour setCurrentPage={setCurrentPage} />}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <NotificationHandler />
    </>
  );
};

export default App;