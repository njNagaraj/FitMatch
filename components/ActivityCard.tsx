
import React from 'react';
import { Activity } from '../types';
import { useAppContext } from '../contexts/AppContext';

// FIX: Define the missing ActivityCardProps interface
interface ActivityCardProps {
  activity: Activity;
}

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const { getSportById, getUserById, joinActivity, currentUser } = useAppContext();
  const sport = getSportById(activity.sportId);
  const creator = getUserById(activity.creatorId);

  const sportName = activity.otherSportName || sport?.name;

  if (!currentUser) return null;

  const canJoin = activity.participants.length < activity.partnersNeeded || activity.partnersNeeded === 0;
  const isJoined = activity.participants.includes(currentUser.id);

  const handleJoin = () => {
    if (!isJoined && canJoin) {
      joinActivity(activity.id);
    }
  };

  return (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 border border-light-border dark:border-dark-border flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-light-text dark:text-dark-text">{activity.title}</h3>
        <span className={`text-xs font-semibold px-2 py-1 ${getLevelColor(activity.level)}`}>
          {activity.level}
        </span>
      </div>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
        {sportName} - {activity.activityType}
      </p>
      <div className="flex items-center text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
        Created by: <img src={creator?.avatarUrl} alt={creator?.name} className="w-6 h-6 rounded-full mx-2" /> {creator?.name}
      </div>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center">
            {activity.participants.slice(0, 3).map(id => getUserById(id)).map(user => (
                <img key={user?.id} src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-secondary -mr-3" />
            ))}
            {activity.participants.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold -mr-3 border-2 border-light-bg-secondary dark:border-dark-bg-secondary">
                    +{activity.participants.length - 3}
                </div>
            )}
             <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary ml-4">
                {activity.participants.length} / {activity.partnersNeeded === 0 ? '∞' : activity.partnersNeeded} joined
            </span>
        </div>
        <button 
          onClick={handleJoin}
          disabled={isJoined || !canJoin}
          className={`px-4 py-2 text-sm font-semibold text-white ${
            isJoined ? 'bg-gray-400 cursor-not-allowed' : 
            canJoin ? 'bg-primary hover:bg-primary-dark' : 'bg-red-400 cursor-not-allowed'
          } transition-colors`}
        >
          {isJoined ? 'Joined' : 'Join'}
        </button>
      </div>
    </div>
  );
};