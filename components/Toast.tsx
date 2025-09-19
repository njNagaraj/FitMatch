
import React, { useEffect, useState } from 'react';
import { Toast } from '../types';

interface ToastMessageProps {
  toast: Toast;
  onDismiss: (id: number) => void;
}

const ICONS: { [key in Toast['type']]: React.ReactNode } = {
    success: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    error: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    info: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const CLOSE_ICON = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

const ToastMessage: React.FC<ToastMessageProps> = ({ toast, onDismiss }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Entrance animation
    const enterTimeout = setTimeout(() => setShow(true), 10);
    // Set up exit animation
    const exitTimeout = setTimeout(() => {
        setShow(false);
    }, 4500); // Start exit animation before it's removed

    return () => {
        clearTimeout(enterTimeout);
        clearTimeout(exitTimeout);
    };
  }, []);

  const toastStyles = {
    success: 'bg-green-50 border-green-500 text-green-800 dark:bg-dark-bg-secondary dark:text-green-300 dark:border-green-600',
    error: 'bg-red-50 border-red-500 text-red-800 dark:bg-dark-bg-secondary dark:text-red-300 dark:border-red-600',
    info: 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-dark-bg-secondary dark:text-blue-300 dark:border-blue-600',
  };

  return (
    <div
      className={`w-full max-w-sm p-4 border-l-4 flex items-center shadow-lg transition-all duration-300 ease-in-out transform ${toastStyles[toast.type]} ${show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
      role="alert"
    >
      <div className="mr-3">{ICONS[toast.type]}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button onClick={() => onDismiss(toast.id)} className="ml-4 -mr-2 p-1 opacity-70 hover:opacity-100" aria-label="Dismiss">
        {CLOSE_ICON}
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm" aria-live="assertive">
      {toasts.map(toast => (
        <ToastMessage key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
