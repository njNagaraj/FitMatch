import React, { useState } from 'react';
import { Activity } from '../../../shared/types';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useActivities } from '../contexts/ActivityContext';
import { useUsers } from '../../users/contexts/UserContext';
import { ICONS } from '../../../shared/constants';

interface ActivityCardProps {
  activity: Activity;
  distance?: number;
}

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, distance }) => {
  const { currentUser } = useAuth();
  const { getSportById, joinActivity } = useActivities();
  const { getUserById } = useUsers();
  const [isJoining, setIsJoining] = useState(false);

  const sport = getSportById(activity.sportId);
  const creator = getUserById(activity.creatorId);

  const sportName = activity.otherSportName || sport?.name;

  if (!currentUser) return null;

  const canJoin = activity.participants.length < activity.partnersNeeded || activity.partnersNeeded === 0;
  const isJoined = activity.participants.includes(currentUser.id);
  const isCreator = activity.creatorId === currentUser.id;

  const handleJoin = async () => {
    if (isJoining || isJoined || !canJoin || isCreator) return;
    setIsJoining(true);
    try {
      await joinActivity(activity.id);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 border border-light-border dark:border-dark-border flex flex-col rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-light-text dark:text-dark-text">{activity.title}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getLevelColor(activity.level)}`}>
          {activity.level}
        </span>
      </div>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
        {sportName} - {activity.activityType}
      </p>
      <div className="flex items-center text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
        Created by: <span className="font-medium text-light-text dark:text-dark-text ml-2">{creator?.name}</span>
      </div>
      {distance !== undefined && (
        <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary my-2 flex items-center gap-1.5">
            <span className="inline-block w-4 h-4">{ICONS.mapPin}</span>
            <span>{distance.toFixed(1)} km away - </span>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${activity.locationCoords.lat},${activity.locationCoords.lon}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">View Map</a>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center">
             <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {activity.participants.length} / {activity.partnersNeeded === 0 ? '∞' : activity.partnersNeeded} joined
            </span>
        </div>
        <button 
          onClick={handleJoin}
          disabled={isJoined || !canJoin || isCreator || isJoining}
          className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors ${
            isJoined || isCreator ? 'bg-gray-400 cursor-not-allowed' : 
            canJoin ? 'bg-primary hover:bg-primary-dark disabled:bg-gray-400' : 'bg-red-400 cursor-not-allowed'
          }`}
        >
          {isJoining ? 'Joining...' : isJoined ? 'Joined' : isCreator ? 'Created' : 'Join'}
        </button>
      </div>
    </div>
  );
};