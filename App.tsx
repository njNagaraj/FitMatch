
import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CreateActivity } from './components/CreateActivity';
import { MyActivities } from './components/MyActivities';
import { Events } from './components/Events';
import { Chats } from './components/Chats';
import { Profile } from './components/Profile';
import { useFitMatchData } from './useFitMatchData';
import { NotificationHandler } from './components/NotificationHandler';
import { ICONS } from './constants';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { AdminDashboard } from './components/AdminDashboard';

const App = () => {
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

  const appData = useFitMatchData();

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
    if (appData.isAuthenticated) {
        if (appData.isAdmin) {
            setCurrentPage(Page.AdminDashboard);
        } else {
            setCurrentPage(Page.Home);
        }
    } else {
        setCurrentPage(Page.Home); // Reset for next login
    }
  }, [appData.isAuthenticated, appData.isAdmin])

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case Page.AdminDashboard:
        return appData.isAdmin ? <AdminDashboard data={appData} /> : <Dashboard data={appData} setCurrentPage={setCurrentPage} />;
      case Page.Home:
        return <Dashboard data={appData} setCurrentPage={setCurrentPage} />;
      case Page.CreateActivity:
        return <CreateActivity data={appData} setCurrentPage={setCurrentPage} />;
      case Page.MyActivities:
        return <MyActivities data={appData} />;
      case Page.Events:
        return <Events data={appData} />;
      case Page.Chats:
        return <Chats data={appData} />;
      case Page.Profile:
        return <Profile data={appData} />;
      default:
        return <Dashboard data={appData} setCurrentPage={setCurrentPage} />;
    }
  };

  if (!appData.isAuthenticated) {
    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen font-sans text-light-text dark:text-dark-text">
            {authPage === 'login' ? (
                <Login data={appData} setAuthPage={setAuthPage} />
            ) : (
                <Signup data={appData} setAuthPage={setAuthPage} />
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
        logout={appData.logout}
        isAdmin={appData.isAdmin}
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
      <NotificationHandler data={appData} />
    </div>
  );
};

export default App;
