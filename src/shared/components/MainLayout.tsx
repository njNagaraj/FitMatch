import React, { useState } from 'react';
import { Page, Activity } from '../types';
import { Sidebar } from './Sidebar';
import { Dashboard } from '../../features/dashboard/components/Dashboard';
import { CreateActivity } from '../../features/activities/components/CreateActivity';
import { MyActivities } from '../../features/activities/components/MyActivities';
import { Events } from '../../features/events/components/Events';
import { Chats } from '../../features/chats/components/Chats';
import { Profile } from '../../features/profile/components/Profile';
import { AdminDashboard } from '../../features/admin/components/AdminDashboard';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useActivities } from '../../features/activities/contexts/ActivityContext';
import { ICONS } from '../constants';

interface MainLayoutProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  activityToEdit: Activity | null;
  setActivityToEdit: (activity: Activity | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentPage, setCurrentPage, activityToEdit, setActivityToEdit, theme, toggleTheme }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { isAdmin } = useAuth();
    const { locationPreference, setLocationPreference } = useActivities();

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
        </div>
    );
};