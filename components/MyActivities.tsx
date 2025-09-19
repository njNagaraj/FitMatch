
import React from 'react';
import { FitMatchData } from '../useFitMatchData';
import { Activity } from '../types';

const MyActivityCard: React.FC<{ activity: Activity; data: FitMatchData; isCreator: boolean }> = ({ activity, data, isCreator }) => {
  const { getSportById, getUserById, leaveActivity, deleteActivity } = data;
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
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 border border-light-border dark:border-dark-border flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg text-light-text dark:text-dark-text">{activity.title}</h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">{sportName} - {activity.level}</p>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
          {new Date(activity.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
        <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Participants:</span>
            {activity.participants.slice(0, 4).map(id => getUserById(id)).map(user => (
                <img key={user?.id} src={user?.avatarUrl} alt={user?.name} title={user?.name} className="w-8 h-8 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-secondary -mr-2" />
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
          <button onClick={handleDelete} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">Delete</button>
        ) : (
          <button onClick={handleLeave} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-yellow-600 hover:bg-yellow-700 transition-colors">Leave</button>
        )}
      </div>
    </div>
  );
};


export const MyActivities: React.FC<{ data: FitMatchData }> = ({ data }) => {
  const { myActivities, currentUser } = data;
  
  const createdActivities = myActivities.filter(a => a.creatorId === currentUser.id);
  const joinedActivities = myActivities.filter(a => a.creatorId !== currentUser.id);

  return (
    <div className="p-4 sm:p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">My Activities</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Created by You ({createdActivities.length})</h2>
        {createdActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {createdActivities.map(activity => (
              <MyActivityCard key={activity.id} activity={activity} data={data} isCreator={true} />
            ))}
          </div>
        ) : (
          <p className="text-light-text-secondary dark:text-dark-text-secondary">You haven't created any activities yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Joined Activities ({joinedActivities.length})</h2>
         {joinedActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {joinedActivities.map(activity => (
              <MyActivityCard key={activity.id} activity={activity} data={data} isCreator={false} />
            ))}
          </div>
        ) : (
          <p className="text-light-text-secondary dark:text-dark-text-secondary">You haven't joined any activities yet. Go find one!</p>
        )}
      </section>
    </div>
  );
};
