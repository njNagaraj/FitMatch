import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../../../shared/types';
import { userService } from '../../../api/services/userService';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useToast } from '../../../shared/contexts/ToastContext';

interface UserContextType {
  users: User[];
  loading: boolean;
  getUserById: (id: string) => User | undefined;
  deleteUser: (userId: string) => Promise<void>;
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
  
  const deleteUser = async (userId: string) => {
    const userToDelete = getUserById(userId);
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      addToast(`User "${userToDelete.name}" has been deleted.`, 'info');
    } catch(error) {
      addToast('Failed to delete user.', 'error');
    }
  };

  const value = {
    users,
    loading,
    getUserById,
    deleteUser,
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
