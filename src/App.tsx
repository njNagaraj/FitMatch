import React, { useState, useEffect } from 'react';
import { Page, Activity } from './shared/types';
import { Sidebar } from './shared/components/Sidebar';
import { Dashboard } from './features/dashboard/components/Dashboard';
import { CreateActivity } from './features/activities/components/CreateActivity';
import { MyActivities } from './features/activities/components/MyActivities';
import { Events } from './features/events/components/Events';
import { Chats } from './features/chats/components/Chats';
import { Profile } from './features/profile/components/Profile';
import { NotificationHandler } from './shared/components/NotificationHandler';
import { ICONS } from './shared/constants';
import { Login } from './auth/components/Login';
import { Signup } from './auth/components/Signup';
import { AdminDashboard } from './features/admin/components/AdminDashboard';
import { ToastContainer } from './shared/components/Toast';
import { OnboardingTour } from './features/onboarding/components/OnboardingTour';

import { AuthProvider, useAuth } from './auth/contexts/AuthContext';
import { ActivityProvider, useActivities } from './features/activities/contexts/ActivityContext';
import { EventProvider } from './features/events/contexts/EventContext';
import { ChatProvider } from './features/chats/contexts/ChatContext';
import { UserProvider } from './features/users/contexts/UserContext';
import { ToastProvider, useToast } from './shared/contexts/ToastContext';
import { TourProvider, useTour } from './features/onboarding/contexts/TourContext';

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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
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
  const { locationPreference, setLocationPreference } = useActivities();
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
  
  const handleEditActivity = (activity: Activity) => {
    setActivityToEdit(activity);
    setCurrentPage(Page.CreateActivity);
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case Page.AdminDashboard:
        return isAdmin ? <AdminDashboard /> : <Dashboard setCurrentPage={setCurrentPage} />;
      case Page.Home:
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case Page.CreateActivity:
        return <CreateActivity setCurrentPage={setCurrentPage} activityToEdit={activityToEdit} setActivityToEdit={setActivityToEdit} />;
      case Page.MyActivities:
        return <MyActivities onEditActivity={handleEditActivity} />;
      case Page.Events:
        return <Events />;
      case Page.Chats:
        return <Chats />;
      case Page.Profile:
        return <Profile />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
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

  if (!isAuthenticated) {
    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen font-sans text-light-text dark:text-dark-text">
            {authPage === 'login' ? (
                <Login setAuthPage={setAuthPage} />
            ) : (
                <Signup setAuthPage={setAuthPage} />
            )}
        </div>
    );
  }

  return (
    <div className="flex bg-light-bg dark:bg-dark-bg min-h-screen font-sans text-light-text dark:text-dark-text relative">
      {isSidebarOpen && (
        <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            aria-hidden="true"
        ></div>
      )}
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        theme={theme}
        toggleTheme={toggleTheme}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        locationPreference={locationPreference}
        setLocationPreference={setLocationPreference}
      />
      <div className="flex-1 flex flex-col h-screen">
          <header className="lg:hidden flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary flex-shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="text-light-text dark:text-dark-text">
              {ICONS.menu}
            </button>
            <h1 className="text-lg font-bold">{currentPage}</h1>
            <div className="w-6"></div> {/* Spacer */}
          </header>
          <main className="flex-1 overflow-y-auto">
            {renderPage()}
          </main>
      </div>
      {isTourOpen && <OnboardingTour setCurrentPage={setCurrentPage} />}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <NotificationHandler />
    </div>
  );
};

export default App;
