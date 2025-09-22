import React, { useEffect, useRef, useState } from 'react';
import { TOUR_STEPS } from '../tourSteps';
import { Page } from '../../../shared/types';
import { useTour } from '../contexts/TourContext';

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const OnboardingTour: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const { isTourOpen, tourStepIndex, nextTourStep, prevTourStep, endTour } = useTour();
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const currentStep = TOUR_STEPS[tourStepIndex];

  useEffect(() => {
    if (!isTourOpen || !currentStep) {
      setTargetRect(null);
      return;
    }

    if (currentStep.page) {
        setCurrentPage(currentStep.page);
    }
    
    // We need a slight delay for the page to render and the element to be available.
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      const element = document.querySelector(currentStep.selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } else {
        console.warn(`Tour target not found: ${currentStep.selector}`);
        setTargetRect(null); // Hide highlight if element not found
      }
    }, 150); // 150ms delay should be enough for page transition.

    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

  }, [tourStepIndex, isTourOpen, currentStep, setCurrentPage]);
  
  if (!isTourOpen || !currentStep) {
    return null;
  }
  
  const popoverStyle: React.CSSProperties = {};
  if (targetRect) {
    // Position popover below the target, centered. Handle screen edges.
    let top = targetRect.top + targetRect.height + 15;
    let left = targetRect.left + targetRect.width / 2;

    // Adjust if popover goes off-screen
    if (top + 200 > window.innerHeight) { // Assuming popover height ~200px
        top = targetRect.top - 200 - 5; // Position above
    }
     if (top < 10) {
        top = 10;
    }
    popoverStyle.top = `${top}px`;
    popoverStyle.left = `${left}px`;
    popoverStyle.transform = 'translateX(-50%)';

    if (left < 170) { // Assuming popover width ~320px
      popoverStyle.left = '10px';
      popoverStyle.transform = 'translateX(0)';
    }
    if (left + 170 > window.innerWidth) {
      popoverStyle.left = `${window.innerWidth - 330}px`;
      popoverStyle.transform = 'translateX(0)';
    }

  } else {
    // Center if no target
    popoverStyle.top = '50%';
    popoverStyle.left = '50%';
    popoverStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100]" onClick={endTour}></div>
      
      {/* Highlight Box */}
      {targetRect && (
        <div
          className="fixed bg-transparent rounded-lg border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-[101] transition-all duration-300 ease-in-out pointer-events-none"
          style={{
            top: targetRect.top - 5,
            left: targetRect.left - 5,
            width: targetRect.width + 10,
            height: targetRect.height + 10,
          }}
        ></div>
      )}

      {/* Popover Content */}
      <div
        className="fixed bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 rounded-lg border border-light-border dark:border-dark-border w-80 z-[102] transition-all duration-300 ease-in-out"
        style={popoverStyle}
        role="dialog"
        aria-labelledby="tour-heading"
      >
        <h3 id="tour-heading" className="text-lg font-bold mb-2">{currentStep.title}</h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center">
            <span className="text-xs font-medium">{tourStepIndex + 1} / {TOUR_STEPS.length}</span>
            <div className="flex items-center">
                <button onClick={endTour} className="px-3 py-1 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">Skip</button>
                {tourStepIndex > 0 && (
                    <button onClick={prevTourStep} className="px-3 py-1 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md ml-2">Back</button>
                )}
                <button onClick={nextTourStep} className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark ml-2 rounded-md">
                    {tourStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
        <button onClick={endTour} className="absolute top-2 right-2 text-2xl p-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text" aria-label="Close tour">&times;</button>
      </div>
    </>
  );
};