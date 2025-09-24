import React from 'react';
import { MyActivityCard } from './MyActivityCard';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useActivities } from '../contexts/ActivityContext';
import { Activity } from '../../../shared/types';
import { haversineDistance } from '../../../shared/utils/geolocation';

interface MyActivitiesProps {
  onEditActivity: (activity: Activity) => void;
}

export const MyActivities: React.FC<MyActivitiesProps> = ({ onEditActivity }) => {
  const { currentUser } = useAuth();
  const { myActivities, locationPreference } = useActivities();
  
  if (!currentUser) return null;

  const createdActivities = myActivities.filter(a => a.creatorId === currentUser.id);
  const joinedActivities = myActivities.filter(a => a.creatorId !== currentUser.id);

  const searchLocation = locationPreference === 'home' && currentUser.homeLocation 
      ? currentUser.homeLocation 
      : currentUser.currentLocation;

  return (
    <div className="p-4 sm:p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">My Activities</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Created by You ({createdActivities.length})</h2>
        {createdActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {createdActivities.map(activity => {
                const distance = searchLocation ? haversineDistance(searchLocation, activity.locationCoords) : undefined;
                return <MyActivityCard key={activity.id} activity={activity} isCreator={true} onEdit={onEditActivity} distance={distance} />;
            })}
          </div>
        ) : (
          <p className="text-light-text-secondary dark:text-dark-text-secondary">You haven't created any activities yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Joined Activities ({joinedActivities.length})</h2>
         {joinedActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {joinedActivities.map(activity => {
              const distance = searchLocation ? haversineDistance(searchLocation, activity.locationCoords) : undefined;
              return <MyActivityCard key={activity.id} activity={activity} isCreator={false} distance={distance} />;
            })}
          </div>
        ) : (
          <p className="text-light-text-secondary dark:text-dark-text-secondary">You haven't joined any activities yet. Go find one!</p>
        )}
      </section>
    </div>
  );
};