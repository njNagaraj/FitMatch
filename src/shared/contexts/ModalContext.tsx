import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal } from '../components/Modal';

interface ModalOptions {
  title: string;
  message: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

interface ModalContextType {
  showAlert: (options: Pick<ModalOptions, 'title' | 'message'>) => void;
  showConfirm: (options: Omit<ModalOptions, 'cancelText'>) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalOptions | null>(null);

  const handleClose = () => {
    setModalState(null);
  };

  const showAlert = useCallback(({ title, message }: Pick<ModalOptions, 'title' | 'message'>) => {
    setModalState({
      title,
      message,
      confirmText: 'OK',
      onConfirm: handleClose,
      confirmButtonClass: 'bg-primary hover:bg-primary-dark',
    });
  }, []);

  const showConfirm = useCallback(({ title, message, onConfirm, confirmText = 'Confirm', confirmButtonClass = 'bg-primary hover:bg-primary-dark' }: Omit<ModalOptions, 'cancelText'>) => {
    setModalState({
      title,
      message,
      onConfirm,
      confirmText,
      cancelText: 'Cancel',
      confirmButtonClass
    });
  }, []);

  const handleConfirm = () => {
    if (modalState?.onConfirm) {
      modalState.onConfirm();
    }
    handleClose();
  };
  
  const value = { showAlert, showConfirm };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modalState && (
        <Modal 
          isOpen={!!modalState} 
          onClose={handleClose} 
          title={modalState.title}
          footer={
            <>
              {modalState.cancelText && (
                <button 
                  onClick={handleClose} 
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-light-text dark:text-dark-text font-semibold transition-colors rounded-md"
                >
                  {modalState.cancelText}
                </button>
              )}
              <button 
                onClick={handleConfirm} 
                className={`px-4 py-2 text-white font-semibold transition-colors rounded-md ${modalState.confirmButtonClass}`}
              >
                {modalState.confirmText}
              </button>
            </>
          }
        >
          <p className="text-sm">{modalState.message}</p>
        </Modal>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};