import React, { useState } from 'react';
import { Activity } from '../../../shared/types';
import { useActivities } from '../contexts/ActivityContext';
import { useUsers } from '../../users/contexts/UserContext';
import { ICONS } from '../../../shared/constants';

interface MyActivityCardProps {
  activity: Activity;
  isCreator: boolean;
  onEdit?: (activity: Activity) => void;
  distance?: number;
}

export const MyActivityCard: React.FC<MyActivityCardProps> = ({ activity, isCreator, onEdit, distance }) => {
  const { getSportById, leaveActivity, deleteActivity } = useActivities();
  const { getUserById } = useUsers();
  const [isLoading, setIsLoading] = useState(false);

  const sport = getSportById(activity.sportId);
  const sportName = activity.otherSportName || sport?.name;

  const handleLeave = async () => {
    if (isLoading) return;
    if (window.confirm('Are you sure you want to leave this activity?')) {
      setIsLoading(true);
      try {
        await leaveActivity(activity.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (isLoading) return;
    if (window.confirm('Are you sure you want to permanently delete this activity? This cannot be undone.')) {
      setIsLoading(true);
      try {
        await deleteActivity(activity.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 border border-light-border dark:border-dark-border flex flex-col justify-between rounded-lg shadow-sm ${isLoading ? 'opacity-70' : ''}`}>
      <div>
        <h3 className="font-bold text-lg text-light-text dark:text-dark-text">{activity.title}</h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">{sportName} - {activity.level}</p>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
          {new Date(activity.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
        {distance !== undefined && (
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3 flex items-center gap-1.5">
                <span className="inline-block w-4 h-4">{ICONS.mapPin}</span>
                <span>{distance.toFixed(1)} km away - </span>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${activity.locationCoords.lat},${activity.locationCoords.lon}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">View Map</a>
            </div>
        )}
        <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Participants ({activity.participants.length}):</span>
            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
                {activity.participants.map(id => getUserById(id)?.name).join(', ')}
            </span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {isCreator ? (
          <>
            <button onClick={() => onEdit?.(activity)} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-md disabled:bg-gray-400" disabled={isLoading}>Edit</button>
            <button onClick={handleDelete} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors rounded-md disabled:bg-gray-400" disabled={isLoading}>Delete</button>
          </>
        ) : (
          <button onClick={handleLeave} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-yellow-600 hover:bg-yellow-700 transition-colors rounded-md disabled:bg-gray-400" disabled={isLoading}>Leave</button>
        )}
      </div>
    </div>
  );
};