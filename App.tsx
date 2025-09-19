import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CreateActivity } from './components/CreateActivity';
import { MyActivities } from './components/MyActivities';
import { Events } from './components/Events';
import { Chats } from './components/Chats';
import { Profile } from './components/Profile';
import { NotificationHandler } from './components/NotificationHandler';
import { ICONS } from './constants';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { AdminDashboard } from './components/AdminDashboard';
import { ToastContainer } from './components/Toast';
import { AppProvider, useAppContext } from './contexts/AppContext';

// The main App component is now just the provider
const App = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

// This new component contains the logic that was in App
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Get everything from the context
  const { 
    isAuthenticated, 
    loading, 
    currentUser, 
    isAdmin, 
    locationPreference, 
    setLocationPreference, 
    toasts, 
    removeToast 
  } = useAppContext();

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
  
  const renderPage = () => {
    switch (currentPage) {
      case Page.AdminDashboard:
        return isAdmin ? <AdminDashboard /> : <Dashboard setCurrentPage={setCurrentPage} />;
      case Page.Home:
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case Page.CreateActivity:
        return <CreateActivity setCurrentPage={setCurrentPage} />;
      case Page.MyActivities:
        return <MyActivities />;
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <NotificationHandler />
    </div>
  );
};

export default App;
