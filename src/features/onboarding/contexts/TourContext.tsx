import React, { createContext, useContext, useState, useEffect } from 'react';
import { TOUR_STEPS } from '../tourSteps';
import { useAuth } from '../../../auth/contexts/AuthContext';

interface TourContextType {
  isTourOpen: boolean;
  tourStepIndex: number;
  startTour: () => void;
  endTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const { isAuthenticated, currentUser } = useAuth();
  
  // Logic to automatically start tour for new users on signup
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const shouldStartTour = sessionStorage.getItem('start_tour') === 'true';
      const hasCompletedTour = localStorage.getItem(`fitmatch_hasCompletedTour_${currentUser.id}`);
      
      if (shouldStartTour && !hasCompletedTour) {
        startTour();
      }
    }
  }, [isAuthenticated, currentUser]);

  const startTour = () => {
    setTourStepIndex(0);
    setIsTourOpen(true);
  };

  const endTour = () => {
    setIsTourOpen(false);
    sessionStorage.removeItem('start_tour');
    if (currentUser) {
      localStorage.setItem(`fitmatch_hasCompletedTour_${currentUser.id}`, 'true');
    }
  };

  const nextTourStep = () => {
    if (tourStepIndex < TOUR_STEPS.length - 1) {
      setTourStepIndex(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const prevTourStep = () => {
    if (tourStepIndex > 0) {
      setTourStepIndex(prev => prev - 1);
    }
  };

  const value = {
    isTourOpen,
    tourStepIndex,
    startTour,
    endTour,
    nextTourStep,
    prevTourStep,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
