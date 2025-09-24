import React, { useState, useEffect } from 'react';
import { MapPicker } from '../../../shared/components/MapPicker';
import { StatBox } from './StatBox';
import { FormRow } from '../../../shared/components/FormRow';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useActivities } from '../../activities/contexts/ActivityContext';
import { useToast } from '../../../shared/contexts/ToastContext';


export const Profile: React.FC = () => {
    const { currentUser, updateUserProfile } = useAuth();
    const { myActivities } = useActivities();
    const { addToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    
    // Form state
    const [name, setName] = useState(currentUser?.name || '');
    const [homeLocation, setHomeLocation] = useState(currentUser?.homeLocation);
    const [viewRadius, setViewRadius] = useState(currentUser?.viewRadius || 5);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);


    useEffect(() => {
        if (currentUser && !isEditing) {
            setName(currentUser.name);
            setHomeLocation(currentUser.homeLocation);
            setViewRadius(currentUser.viewRadius || 5);
        }
    }, [currentUser, isEditing]);


    if (!currentUser) {
        return <div>Loading profile...</div>;
    }
    
    const createdCount = myActivities.filter(a => a.creatorId === currentUser.id).length;
    const joinedCount = myActivities.filter(a => a.creatorId !== currentUser.id).length;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        try {
            await updateUserProfile({
                name,
                homeLocation,
                viewRadius,
            });
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form state to original
        setName(currentUser.name);
        setHomeLocation(currentUser.homeLocation);
        setViewRadius(currentUser.viewRadius || 5);
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
            <div className="max-w-2xl mx-auto bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 border border-light-border dark:border-dark-border rounded-lg shadow-sm">
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
                                   <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary" />
                               </FormRow>
                               <FormRow label="Home Location">
                                   <div className="p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md flex justify-between items-center gap-2">
                                       <div className="flex-1 min-w-0">
                                            <p className="text-sm text-light-text dark:text-dark-text truncate">
                                                {homeLocation?.name || 'Not set'}
                                            </p>
                                       </div>
                                       <button type="button" onClick={() => setIsMapOpen(true)} className="flex-shrink-0 px-4 py-1 bg-primary text-white text-sm font-semibold rounded-md">Set on Map</button>
                                   </div>
                                </FormRow>

                                <FormRow label={`Search Radius: ${viewRadius} km`}>
                                   <input 
                                     type="range" 
                                     min="5" 
                                     max="50" 
                                     step="1" 
                                     value={viewRadius} 
                                     onChange={e => setViewRadius(Number(e.target.value))} 
                                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary" 
                                   />
                                </FormRow>

                               <div className="flex gap-2 pt-2">
                                   <button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 transition-colors rounded-md disabled:bg-gray-400" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={handleCancel} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-light-text dark:text-dark-text font-semibold px-4 py-2 transition-colors rounded-md" disabled={isSaving}>
                                        Cancel
                                    </button>
                               </div>
                           </form>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold">{currentUser.name}</h2>
                                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">{currentUser.email}</p>
                                <div className="mt-4 text-sm bg-light-bg dark:bg-dark-bg inline-block p-2 border border-light-border dark:border-dark-border rounded-md">
                                    <span className="font-semibold">Home Location: </span> {currentUser.homeLocation?.name || 'Not Set'}
                                </div>
                                <div className="mt-2 text-sm bg-light-bg dark:bg-dark-bg inline-block p-2 border border-light-border dark:border-dark-border rounded-md ml-2">
                                    <span className="font-semibold">Search Radius: </span> {currentUser.viewRadius || 5} km
                                </div>
                                <div className="grid grid-cols-2 gap-4 my-6">
                                    <StatBox label="Activities Created" value={createdCount} />
                                    <StatBox label="Activities Joined" value={joinedCount} />
                                </div>
                                <button onClick={() => setIsEditing(true)} className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 transition-colors rounded-md" data-tour-id="profile-edit">
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