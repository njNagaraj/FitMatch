import React, { useEffect, useRef } from 'react';
import { ICONS } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus trapping
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    // Initially focus the close button or the first focusable element.
    (closeButtonRef.current || firstElement)?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
        if (!modalRef.current || !document.body.contains(modalRef.current)) return;
        
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    event.preventDefault();
                }
            }
        }
    };
    
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[99] flex items-center justify-center p-4" 
      aria-modal="true" 
      role="dialog"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="bg-light-bg-secondary dark:bg-dark-bg-secondary w-full max-w-md flex flex-col border border-light-border dark:border-dark-border rounded-lg shadow-xl"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
      >
        <header className="p-4 border-b border-light-border dark:border-dark-border flex-shrink-0 flex justify-between items-center">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text">{title}</h2>
          <button ref={closeButtonRef} onClick={onClose} className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text p-1" aria-label="Close">
            {ICONS.close}
          </button>
        </header>
        <div className="flex-grow p-6 text-light-text-secondary dark:text-dark-text-secondary">
          {children}
        </div>
        {footer && (
          <footer className="p-4 border-t border-light-border dark:border-dark-border flex justify-end gap-4 flex-shrink-0 bg-light-bg dark:bg-dark-bg rounded-b-lg">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};