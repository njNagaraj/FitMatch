import React from 'react';
import { ICONS } from '../../../shared/constants';
import { AdminStatCard } from './AdminStatCard';
import { useUsers } from '../../users/contexts/UserContext';
import { useActivities } from '../../activities/contexts/ActivityContext';
import { useEvents } from '../../events/contexts/EventContext';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useToast } from '../../../shared/contexts/ToastContext';

export const AdminDashboard: React.FC = () => {
  const { users, deleteUser, getUserById } = useUsers();
  const { activities, deleteActivity } = useActivities();
  const { events } = useEvents();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const handleDeleteUser = (userId: string) => {
    if(userId === currentUser?.id) {
        addToast("You cannot delete your own account.", 'error');
        return;
    }
    if (window.confirm('Are you sure you want to permanently delete this user and all their created activities?')) {
      deleteUser(userId);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this activity?')) {
      deleteActivity(activityId);
    }
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
                  <th scope="col" className="px-6 py-3">Role</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-light-border dark:border-dark-border">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                        <div>
                            <p>{user.name}</p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{user.email}</p>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? 
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900 rounded-full">Admin</span> : 
                        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900 rounded-full">User</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDeleteUser(user.id)} disabled={user.id === currentUser?.id} className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
                    </td>
                  </tr>
                ))}
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
                   return (
                    <tr key={activity.id} className="border-b border-light-border dark:border-dark-border">
                        <td className="px-6 py-4 font-medium">{activity.title}</td>
                        <td className="px-6 py-4">{creator?.name || 'N/A'}</td>
                        <td className="px-6 py-4">{activity.participants.length} / {activity.partnersNeeded === 0 ? '∞' : activity.partnersNeeded}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDeleteActivity(activity.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
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