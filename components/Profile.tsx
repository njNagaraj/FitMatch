import React from 'react';
import { FitMatchData } from '../useFitMatchData';

const StatBox: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 text-center border border-light-border dark:border-dark-border">
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
    </div>
);

export const Profile: React.FC<{ data: FitMatchData }> = ({ data }) => {
    const { currentUser, myActivities } = data;

    if (!currentUser) {
        return <div>Loading profile...</div>;
    }
    
    const createdCount = myActivities.filter(a => a.creatorId === currentUser.id).length;
    const joinedCount = myActivities.filter(a => a.creatorId !== currentUser.id).length;

    return (
        <div className="p-4 sm:p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">Profile</h1>
            <div className="max-w-md mx-auto bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 border border-light-border dark:border-dark-border text-center">
                <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary"
                />
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">Fitness Enthusiast</p>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <StatBox label="Activities Created" value={createdCount} />
                    <StatBox label="Activities Joined" value={joinedCount} />
                </div>

                 <button className="mt-8 w-full bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-3 transition-colors">
                    Edit Profile
                </button>
            </div>
        </div>
    );
};
