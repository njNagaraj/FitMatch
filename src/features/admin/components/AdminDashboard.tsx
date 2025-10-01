import React, { useState } from 'react';
import { ICONS } from '../../../shared/constants';
import { AdminStatCard } from './AdminStatCard';
import { useUsers } from '../../users/contexts/UserContext';
import { useActivities } from '../../activities/contexts/ActivityContext';
import { useEvents } from '../../events/contexts/EventContext';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useToast } from '../../../shared/contexts/ToastContext';
import { useModal } from '../../../shared/contexts/ModalContext';

export const AdminDashboard: React.FC = () => {
  const { users, setUserDeactivationStatus, getUserById } = useUsers();
  const { activities, deleteActivity } = useActivities();
  const { events } = useEvents();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { showConfirm } = useModal();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleUpdateUserStatus = (userId: string, isDeactivated: boolean) => {
    if(userId === currentUser?.id) {
        addToast("You cannot change the status of your own account.", 'error');
        return;
    }
    const action = isDeactivated ? 'deactivate' : 'activate';
    const user = getUserById(userId);
    if (!user) return;
    
    showConfirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      message: `Are you sure you want to ${action} the account for "${user.name}"?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      confirmButtonClass: isDeactivated ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700',
      onConfirm: async () => {
        setProcessingId(userId);
        try {
          await setUserDeactivationStatus(userId, isDeactivated);
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleDeleteActivity = (activityId: string) => {
    showConfirm({
      title: 'Delete Activity',
      message: 'Are you sure you want to permanently delete this activity?',
      confirmText: 'Delete',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        setProcessingId(activityId);
        try {
          await deleteActivity(activityId);
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 overflow-y-auto h-full">
      <header>
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Admin Dashboard</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">Welcome, {currentUser?.name}. Manage your application here.</p>
      </header>

      <section className="flex gap-4 flex-wrap">
        <AdminStatCard title="Total Users" value={users.length} icon={ICONS.users} />
        <AdminStatCard title="Total Activities" value={activities.length} icon={ICONS.calendar} />
        <AdminStatCard title="Total Events" value={events.length} icon={ICONS.events} />
      </section>

      {/* User Management */}
      <section>
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">User Management</h2>
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-light-bg dark:bg-dark-bg text-xs uppercase text-light-text-secondary dark:text-dark-text-secondary">
                <tr>
                  <th scope="col" className="px-6 py-3">User</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const isProcessing = processingId === user.id;
                  const isDeactivated = user.isDeactivated;
                  return (
                  <tr key={user.id} className={`border-b border-light-border dark:border-dark-border ${isProcessing ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                        <div>
                            <p>{user.name} {user.isAdmin ? '(Admin)' : ''}</p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{user.email}</p>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      {isDeactivated ? 
                        <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900 rounded-full">Deactivated</span> : 
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900 rounded-full">Active</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleUpdateUserStatus(user.id, !isDeactivated)} disabled={user.id === currentUser?.id || isProcessing} className={`font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed ${isDeactivated ? 'text-green-600 dark:text-green-500' : 'text-yellow-600 dark:text-yellow-500'}`}>
                        {isProcessing ? 'Updating...' : isDeactivated ? 'Activate' : 'Deactivate'}
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
       {/* Activity Management */}
      <section>
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Activity Management</h2>
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-light-bg dark:bg-dark-bg text-xs uppercase text-light-text-secondary dark:text-dark-text-secondary">
                <tr>
                  <th scope="col" className="px-6 py-3">Activity Title</th>
                  <th scope="col" className="px-6 py-3">Creator</th>
                  <th scope="col" className="px-6 py-3">Participants</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(activity => {
                   const creator = getUserById(activity.creatorId);
                   const isProcessing = processingId === activity.id;
                   return (
                    <tr key={activity.id} className={`border-b border-light-border dark:border-dark-border ${isProcessing ? 'opacity-50' : ''}`}>
                        <td className="px-6 py-4 font-medium">{activity.title}</td>
                        <td className="px-6 py-4">{creator?.name || 'N/A'}</td>
                        <td className="px-6 py-4">{activity.participants.length} / {activity.partnersNeeded === 0 ? '∞' : activity.partnersNeeded}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDeleteActivity(activity.id)} disabled={isProcessing} className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                            {isProcessing ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                    </tr>
                   )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
};