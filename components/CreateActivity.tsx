import React, { useState, useMemo, useEffect } from 'react';
import { FitMatchData } from '../useFitMatchData';
import { Page, Sport } from '../types';
import { MapPicker } from './MapPicker';

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
  const [otherSportName, setOtherSportName] = useState('');
  const [activityType, setActivityType] = useState('');
  const [level, setLevel] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [partnersNeeded, setPartnersNeeded] = useState<string>('1');

  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState(currentUser?.currentLocation);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isOtherSport = sportId === 'other';

  const selectedSport = useMemo(() => sports.find(s => s.id === sportId), [sportId, sports]);
  
  useEffect(() => {
    if (!isOtherSport && selectedSport) {
        setActivityType(selectedSport.activityTypes[0] || '');
        setLevel(selectedSport.levels[0] || '');
    } else {
        setActivityType('');
        setLevel('');
    }
  }, [selectedSport, isOtherSport]);

  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSportId = e.target.value;
    setSportId(newSportId);
    if (newSportId !== 'other') {
        setOtherSportName('');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (isOtherSport && !otherSportName.trim()) newErrors.otherSportName = 'Please specify the sport name.';
    if (!sportId) newErrors.sportId = 'Please select a sport.';
    if (!activityType.trim()) newErrors.activityType = 'Activity type is required.';
    if (!level.trim()) newErrors.level = 'Level is required.';
    if (!dateTime) newErrors.dateTime = 'Date and time are required.';
    else if (new Date(dateTime) <= new Date()) newErrors.dateTime = 'Date must be in the future.';
    if (!locationName.trim()) newErrors.locationName = 'Location is required. Please select one from the map.';
    const partnersNum = Number(partnersNeeded);
    if (isNaN(partnersNum) || partnersNum < 0) newErrors.partnersNeeded = 'Must be a non-negative number.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !currentUser || !locationCoords) return;
    
    createActivity({
      sportId: isOtherSport ? '' : sportId,
      otherSportName: isOtherSport ? otherSportName : undefined,
      title,
      dateTime: new Date(dateTime),
      locationName,
      locationCoords,
      activityType,
      level,
      partnersNeeded: Number(partnersNeeded),
    });
    
    setCurrentPage(Page.MyActivities);
  };
  
  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <>
      <MapPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        initialCenter={locationCoords || currentUser.currentLocation}
        onLocationSelect={({ lat, lon, name }) => {
          setLocationCoords({ lat, lon });
          setLocationName(name);
          setErrors(prev => ({...prev, locationName: ''})); // Clear location error on select
        }}
      />
      <div className="p-4 sm:p-8 h-full overflow-y-auto">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">Create New Activity</h1>
        <form onSubmit={handleSubmit} className="max-w-2xl bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 border border-light-border dark:border-dark-border space-y-4">
          <FormRow label="Activity Title" error={errors.title}>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
          </FormRow>
          
          <FormRow label="Sport" error={errors.sportId}>
              <select value={sportId} onChange={handleSportChange} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary">
                {sports.map(sport => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
                <option value="other">Other...</option>
              </select>
          </FormRow>
          
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOtherSport ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
               <FormRow label="Please Specify Sport" error={errors.otherSportName}>
                  <input type="text" value={otherSportName} onChange={e => setOtherSportName(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
              </FormRow>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isOtherSport ? (
                  <>
                      <FormRow label="Activity Type (e.g., Casual Match)" error={errors.activityType}>
                          <input type="text" value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
                      </FormRow>
                      <FormRow label="Level (e.g., Beginner)" error={errors.level}>
                          <input type="text" value={level} onChange={e => setLevel(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
                      </FormRow>
                  </>
              ) : (
                  <>
                      <FormRow label="Activity Type" error={errors.activityType}>
                          <select value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" disabled={!selectedSport}>
                          {selectedSport?.activityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                      </FormRow>
                      <FormRow label="Level" error={errors.level}>
                          <select value={level} onChange={e => setLevel(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" disabled={!selectedSport}>
                          {selectedSport?.levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                          </select>
                      </FormRow>
                  </>
              )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormRow label="Date and Time" error={errors.dateTime}>
              <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
            </FormRow>
            <FormRow label="Partners Needed (0 for unlimited)" error={errors.partnersNeeded}>
                <input type="number" value={partnersNeeded} onChange={e => setPartnersNeeded(e.target.value)} min="0" className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
            </FormRow>
          </div>
          
          <FormRow label="Location" error={errors.locationName}>
            <div className="p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border flex justify-between items-center">
                <p className="text-sm text-light-text dark:text-dark-text truncate pr-4">
                    {locationName || 'No location selected'}
                </p>
                <button type="button" onClick={() => setIsMapOpen(true)} className="px-4 py-1 bg-primary text-white text-sm font-semibold whitespace-nowrap">Select on Map</button>
            </div>
          </FormRow>

          <div className="pt-4">
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-3 flex items-center justify-center gap-2 transition-colors">
                  Create Activity
              </button>
          </div>
        </form>
      </div>
    </>
  );
};