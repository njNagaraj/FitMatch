import React, { useState, useMemo } from 'react';
import { FitMatchData } from '../useFitMatchData';
import { Page, Sport } from '../types';

interface CreateActivityProps {
  data: FitMatchData;
  setCurrentPage: (page: Page) => void;
}

const FormRow: React.FC<{ label: string; children: React.ReactNode; error?: string }> = ({ label, children, error }) => (
  <div>
    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const CreateActivity: React.FC<CreateActivityProps> = ({ data, setCurrentPage }) => {
  const { sports, createActivity, currentUser } = data;
  
  const [title, setTitle] = useState('');
  const [sportId, setSportId] = useState<string>(sports[0]?.id || '');
  const [activityType, setActivityType] = useState('');
  const [level, setLevel] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [partnersNeeded, setPartnersNeeded] = useState<string>('1');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedSport = useMemo(() => sports.find(s => s.id === sportId), [sportId, sports]);

  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSportId(e.target.value);
    const newSport = sports.find(s => s.id === e.target.value);
    setActivityType(newSport?.activityTypes[0] || '');
    setLevel(newSport?.levels[0] || '');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!sportId) newErrors.sportId = 'Please select a sport.';
    if (!activityType) newErrors.activityType = 'Please select an activity type.';
    if (!level) newErrors.level = 'Please select a level.';
    if (!dateTime) newErrors.dateTime = 'Date and time are required.';
    else if (new Date(dateTime) <= new Date()) newErrors.dateTime = 'Date must be in the future.';
    if (!locationName.trim()) newErrors.locationName = 'Location is required.';
    const partnersNum = Number(partnersNeeded);
    if (isNaN(partnersNum) || partnersNum < 0) newErrors.partnersNeeded = 'Must be a non-negative number.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    createActivity({
      sportId,
      title,
      dateTime: new Date(dateTime),
      locationName,
      // Using current user's location for simplicity for the new activity
      locationCoords: currentUser.location,
      activityType,
      level,
      partnersNeeded: Number(partnersNeeded),
    });

    alert('Activity created successfully!');
    setCurrentPage(Page.MyActivities);
  };
  
  return (
    <div className="p-4 sm:p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">Create New Activity</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 border border-light-border dark:border-dark-border space-y-4">
        <FormRow label="Activity Title" error={errors.title}>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
        </FormRow>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Sport" error={errors.sportId}>
            <select value={sportId} onChange={handleSportChange} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary">
              {sports.map(sport => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
            </select>
          </FormRow>
          <FormRow label="Activity Type" error={errors.activityType}>
            <select value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" disabled={!selectedSport}>
              {selectedSport?.activityTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </FormRow>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormRow label="Level" error={errors.level}>
                <select value={level} onChange={e => setLevel(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" disabled={!selectedSport}>
                {selectedSport?.levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
            </FormRow>
            <FormRow label="Partners Needed (0 for unlimited)" error={errors.partnersNeeded}>
                 <input type="number" value={partnersNeeded} onChange={e => setPartnersNeeded(e.target.value)} min="0" className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
            </FormRow>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormRow label="Date and Time" error={errors.dateTime}>
                <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
            </FormRow>
            <FormRow label="Location Name (e.g., Cubbon Park)" error={errors.locationName}>
                <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
            </FormRow>
        </div>
        <div className="pt-4">
            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-3 flex items-center justify-center gap-2 transition-colors">
                Create Activity
            </button>
        </div>
      </form>
    </div>
  );
};
