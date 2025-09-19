import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MapPicker } from './MapPicker';
import { useAppContext } from '../contexts/AppContext';

const StatBox: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
    <div className="bg-light-bg dark:bg-dark-bg p-4 text-center border border-light-border dark:border-dark-border">
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
    </div>
);

const FormRow: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
  <div className="text-left">
    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{label}</label>
    {children}
  </div>
);


export const Profile: React.FC = () => {
    const { currentUser, myActivities, updateUserProfile, addToast } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    
    // Form state
    const [name, setName] = useState(currentUser?.name || '');
    const [homeLocation, setHomeLocation] = useState(currentUser?.homeLocation);
    const [isMapOpen, setIsMapOpen] = useState(false);


    useEffect(() => {
        if (currentUser && !isEditing) {
            setName(currentUser.name);
            setHomeLocation(currentUser.homeLocation);
        }
    }, [currentUser, isEditing]);


    if (!currentUser) {
        return <div>Loading profile...</div>;
    }
    
    const createdCount = myActivities.filter(a => a.creatorId === currentUser.id).length;
    const joinedCount = myActivities.filter(a => a.creatorId !== currentUser.id).length;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserProfile({
            name,
            homeLocation,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset form state to original
        setName(currentUser.name);
        setHomeLocation(currentUser.homeLocation);
        setIsEditing(false);
    }

    return (
        <>
        <MapPicker 
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            initialCenter={homeLocation || currentUser.currentLocation}
            onLocationSelect={({lat, lon, name}) => {
                setHomeLocation({ lat, lon, name });
                addToast("Home location updated. Press Save to confirm.", "info");
            }}
        />
        <div className="p-4 sm:p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">Profile</h1>
            <div className="max-w-2xl mx-auto bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 border border-light-border dark:border-dark-border">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left sm:space-x-8">
                    <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name} 
                        className="w-32 h-32 rounded-full mb-4 sm:mb-0 border-4 border-primary flex-shrink-0"
                    />
                    <div className="flex-grow w-full">
                        {isEditing ? (
                           <form onSubmit={handleSave} className="space-y-4">
                               <FormRow label="Full Name">
                                   <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
                               </FormRow>
                               <FormRow label="Home Location">
                                   <div className="p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border flex justify-between items-center">
                                       <p className="text-sm text-light-text dark:text-dark-text truncate pr-4">
                                           {homeLocation?.name || 'Not set'}
                                       </p>
                                       <button type="button" onClick={() => setIsMapOpen(true)} className="px-4 py-1 bg-primary text-white text-sm font-semibold whitespace-nowrap">Set on Map</button>
                                   </div>
                                </FormRow>

                               <div className="flex gap-2 pt-2">
                                   <button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 transition-colors">
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={handleCancel} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-light-text dark:text-dark-text font-semibold px-4 py-2 transition-colors">
                                        Cancel
                                    </button>
                               </div>
                           </form>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold">{currentUser.name}</h2>
                                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">{currentUser.email}</p>
                                <div className="mt-4 text-sm bg-light-bg dark:bg-dark-bg inline-block p-2 border border-light-border dark:border-dark-border">
                                    <span className="font-semibold">Home Location: </span> {currentUser.homeLocation?.name || 'Not Set'}
                                </div>
                                <div className="grid grid-cols-2 gap-4 my-6">
                                    <StatBox label="Activities Created" value={createdCount} />
                                    <StatBox label="Activities Joined" value={joinedCount} />
                                </div>
                                <button onClick={() => setIsEditing(true)} className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 transition-colors">
                                    Edit Profile
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};