import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../../../shared/types';
import { userService } from '../../../api/services/userService';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useToast } from '../../../shared/contexts/ToastContext';

interface UserContextType {
  users: User[];
  loading: boolean;
  getUserById: (id: string) => User | undefined;
  setUserDeactivationStatus: (userId: string, isDeactivated: boolean) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const fetchedUsers = await userService.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getUserById = (id: string) => users.find(u => u.id === id);
  
  const setUserDeactivationStatus = async (userId: string, isDeactivated: boolean) => {
    const userToUpdate = getUserById(userId);
    if (!userToUpdate) return;
    try {
      const updatedUser = await userService.setUserDeactivationStatus(userId, isDeactivated);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isDeactivated: updatedUser.isDeactivated } : u));
      addToast(`User "${userToUpdate.name}" has been ${isDeactivated ? 'deactivated' : 'activated'}.`, 'info');
    } catch(error: any) {
      addToast(error.message || 'Failed to update user status.', 'error');
    }
  };

  const value = {
    users,
    loading,
    getUserById,
    setUserDeactivationStatus,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsers = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};