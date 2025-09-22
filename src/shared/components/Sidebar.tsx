import React from 'react';
import { Page } from '../types';
import { ICONS, APP_NAME, APP_TAGLINE } from '../constants';
import { useAuth } from '../../auth/contexts/AuthContext';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  locationPreference: 'current' | 'home';
  setLocationPreference: (preference: 'current' | 'home') => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  [key: string]: any; // Allow other props like data-tour-id
}> = ({ label, icon, isActive, onClick, ...props }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 my-1 text-sm font-medium transition-colors duration-200 rounded-lg ${
      isActive
        ? 'bg-primary text-white'
        : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary-light dark:hover:bg-dark-bg'
    }`}
    aria-current={isActive ? 'page' : undefined}
    {...props}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, theme, toggleTheme, isSidebarOpen, setSidebarOpen, locationPreference, setLocationPreference }) => {
  const { logout, isAdmin, currentUser } = useAuth();

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false); // Close sidebar on navigation
  };

  const baseNavLinks: { label: Page; icon: React.ReactNode }[] = [
    { label: Page.CreateActivity, icon: ICONS.create },
    { label: Page.MyActivities, icon: ICONS.myActivities },
    { label: Page.Events, icon: ICONS.events },
    { label: Page.Chats, icon: ICONS.chats },
    { label: Page.Profile, icon: ICONS.profile },
  ];

  const adminLinks = [
      { label: Page.AdminDashboard, icon: ICONS.adminDashboard },
      ...baseNavLinks.filter(link => link.label !== Page.Profile), // Remove profile from admin base links for clarity
      { label: Page.Profile, icon: ICONS.profile },
  ];

  const userLinks = [
      { label: Page.Home, icon: ICONS.home },
      ...baseNavLinks
  ];

  const navLinks = isAdmin ? adminLinks : userLinks;

  return (
    <aside className={`w-64 h-screen bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 flex flex-col flex-shrink-0 border-r border-light-border dark:border-dark-border
      fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center">
            <div className="bg-primary p-2 mr-3 text-white rounded-lg">
            {ICONS.logo}
            </div>
            <div>
            <h1 className="text-xl font-bold text-light-text dark:text-dark-text">{APP_NAME}</h1>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{APP_TAGLINE}</p>
            </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-light-text-secondary dark:text-dark-text-secondary">
          {ICONS.close}
        </button>
      </div>

      <nav className="flex-grow" data-tour-id="sidebar-nav">
        {navLinks.map(({ label, icon }) => {
          const navItemProps: {[key: string]: any} = {};
          if (label === Page.CreateActivity) navItemProps['data-tour-id'] = 'create-activity-nav';
          if (label === Page.MyActivities) navItemProps['data-tour-id'] = 'my-activities-nav';

          return (
            <NavItem
              key={label}
              label={label.toString()}
              icon={icon}
              isActive={currentPage === label}
              onClick={() => handlePageChange(label)}
              {...navItemProps}
            />
          );
        })}
      </nav>

      <div className="mt-auto space-y-2">
         <div className="px-2 py-2" data-tour-id="location-switcher">
            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2 px-2 font-medium">Location Basis</div>
            <div className="flex bg-light-bg dark:bg-dark-bg p-1 rounded-lg border border-light-border dark:border-dark-border">
                <button 
                    onClick={() => setLocationPreference('current')}
                    className={`flex-1 py-1 text-sm rounded-md transition-colors ${locationPreference === 'current' ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                    Current
                </button>
                <button 
                    onClick={() => { if (currentUser?.homeLocation) { setLocationPreference('home') } }}
                    className={`flex-1 py-1 text-sm rounded-md transition-colors ${locationPreference === 'home' ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={!currentUser?.homeLocation}
                    title={!currentUser?.homeLocation ? "Set a home location in your profile first" : ""}
                >
                    Home
                </button>
            </div>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary-light dark:hover:bg-dark-bg rounded-lg"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span className="mr-3">{theme === 'light' ? ICONS.moon : ICONS.sun}</span>
          {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        <NavItem
            label="Logout"
            icon={ICONS.logout}
            isActive={false}
            onClick={logout}
          />
      </div>
    </aside>
  );
};