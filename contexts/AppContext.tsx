import React, { createContext, useContext } from 'react';
import { useAppData, AppData } from '../hooks/useAppData';

// Create a context with a default value of undefined.
const AppContext = createContext<AppData | undefined>(undefined);

// AppProvider component that will wrap the application
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appData = useAppData();
  return (
    <AppContext.Provider value={appData}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useAppContext = (): AppData => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
