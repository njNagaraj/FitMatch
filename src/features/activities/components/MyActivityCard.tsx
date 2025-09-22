import React from 'react';
import { Activity } from '../../../shared/types';
import { useActivities } from '../contexts/ActivityContext';
import { useUsers } from '../../users/contexts/UserContext';


export const MyActivityCard: React.FC<{ activity: Activity; isCreator: boolean }> = ({ activity, isCreator }) => {
  const { getSportById, leaveActivity, deleteActivity } = useActivities();
  const { getUserById } = useUsers();

  const sport = getSportById(activity.sportId);
  const sportName = activity.otherSportName || sport?.name;

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave this activity?')) {
      leaveActivity(activity.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this activity? This cannot be undone.')) {
      deleteActivity(activity.id);
    }
  };

  return (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 border border-light-border dark:border-dark-border flex flex-col justify-between rounded-lg shadow-sm">
      <div>
        <h3 className="font-bold text-lg text-light-text dark:text-dark-text">{activity.title}</h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">{sportName} - {activity.level}</p>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
          {new Date(activity.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
        <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Participants:</span>
            {activity.participants.slice(0, 4).map(id => getUserById(id)).map(user => (
                user ? <img key={user.id} src={user.avatarUrl} alt={user.name} title={user.name} className="w-8 h-8 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-secondary -mr-2" /> : null
            ))}
            {activity.participants.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold -mr-2 border-2 border-light-bg-secondary dark:border-dark-bg-secondary">
                    +{activity.participants.length - 4}
                </div>
            )}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {isCreator ? (
          <button onClick={handleDelete} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors rounded-md">Delete</button>
        ) : (
          <button onClick={handleLeave} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-yellow-600 hover:bg-yellow-700 transition-colors rounded-md">Leave</button>
        )}
      </div>
    </div>
  );
};