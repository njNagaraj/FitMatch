import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Page, Activity } from '../../../shared/types';
import { MapPicker } from '../../../shared/components/MapPicker';
import { FormRow } from '../../../shared/components/FormRow';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useActivities } from '../contexts/ActivityContext';
import { ICONS } from '../../../shared/constants';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

interface CreateActivityProps {
  setCurrentPage: (page: Page) => void;
  activityToEdit: Activity | null;
  setActivityToEdit: (activity: Activity | null) => void;
}

export const CreateActivity: React.FC<CreateActivityProps> = ({ setCurrentPage, activityToEdit, setActivityToEdit }) => {
  const { currentUser } = useAuth();
  const { sports, createActivity, updateActivity, loading } = useActivities();
  
  const isEditing = !!activityToEdit;
  
  const [title, setTitle] = useState('');
  const [sportId, setSportId] = useState<string>('');
  const [otherSportName, setOtherSportName] = useState('');
  const [activityType, setActivityType] = useState('');
  const [level, setLevel] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [partnersNeeded, setPartnersNeeded] = useState<string>('1');

  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState(currentUser?.currentLocation);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the searchable sport dropdown
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);
  const [sportSearch, setSportSearch] = useState('');
  const sportDropdownRef = useRef<HTMLDivElement>(null);
  const sportSearchInputRef = useRef<HTMLInputElement>(null);

  // Effect to handle populating the form for editing, or resetting for creating.
  useEffect(() => {
    if (activityToEdit) {
      setTitle(activityToEdit.title);
      setActivityType(activityToEdit.activityType);
      setLevel(activityToEdit.level);
      const d = new Date(activityToEdit.dateTime);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      setDateTime(d.toISOString().slice(0, 16));
      
      setPartnersNeeded(String(activityToEdit.partnersNeeded));
      setLocationName(activityToEdit.locationName);
      setLocationCoords(activityToEdit.locationCoords);
      if (activityToEdit.otherSportName) {
        setSportId('other');
        setOtherSportName(activityToEdit.otherSportName);
      } else {
        setSportId(activityToEdit.sportId);
        setOtherSportName('');
      }
    } else {
      setTitle('');
      setSportId(sports[0]?.id || '');
      setOtherSportName('');
      setActivityType('');
      setLevel('');
      setDateTime('');
      setPartnersNeeded('1');
      setLocationName('');
      setLocationCoords(undefined);
      setErrors({});
    }
  }, [activityToEdit, sports]);
  
  useEffect(() => {
      if (!activityToEdit && !locationName && currentUser?.currentLocation) {
          setLocationCoords(currentUser.currentLocation);
      }
  }, [activityToEdit, locationName, currentUser?.currentLocation]);

  const selectedSportForDisplay = useMemo(() => {
    if (sportId === 'other') return { id: 'other', name: 'Other...' };
    return sports.find(s => s.id === sportId);
  }, [sportId, sports]);

  const filteredSports = useMemo(() => {
    return sports.filter(sport => 
        sport.name.toLowerCase().includes(sportSearch.toLowerCase())
    );
  }, [sports, sportSearch]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (sportDropdownRef.current && !sportDropdownRef.current.contains(event.target as Node)) {
            setIsSportDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
      if (isSportDropdownOpen) {
          setTimeout(() => sportSearchInputRef.current?.focus(), 100);
      }
  }, [isSportDropdownOpen]);

  const isOtherSport = sportId === 'other';

  const selectedSport = useMemo(() => sports.find(s => s.id === sportId), [sportId, sports]);
  
  useEffect(() => {
    if (!isEditing && !activityToEdit) {
        if (!isOtherSport && selectedSport) {
            setActivityType(selectedSport.activityTypes[0] || '');
            setLevel(selectedSport.levels[0] || '');
        } else {
            setActivityType('');
            setLevel('');
        }
    }
  }, [selectedSport, isOtherSport, isEditing, activityToEdit]);

  const handleSelectSport = (selectedId: string) => {
    setSportId(selectedId);
    if (selectedId !== 'other') {
        setOtherSportName('');
    }
    setIsSportDropdownOpen(false);
    setSportSearch('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validate() || !currentUser || !locationCoords) return;
    
    setIsSubmitting(true);
    try {
      const activityData = {
        sportId: isOtherSport ? '' : sportId,
        otherSportName: isOtherSport ? otherSportName : undefined,
        title,
        dateTime: new Date(dateTime),
        locationName,
        locationCoords,
        activityType,
        level,
        partnersNeeded: Number(partnersNeeded),
      };
      
      let success = false;
      if (isEditing && activityToEdit) {
          success = await updateActivity(activityToEdit.id, activityData);
      } else {
          success = await createActivity(activityData);
      }
      
      if (success) {
          setActivityToEdit(null);
          setCurrentPage(Page.MyActivities);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!currentUser) {
    return <div>Loading...</div>
  }

  if (loading) {
    return <LoadingSpinner message="Loading form data..." />;
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
          setErrors(prev => ({...prev, locationName: ''}));
        }}
      />
      <div className="p-4 sm:p-8 h-full overflow-y-auto">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">{isEditing ? 'Edit Activity' : 'Create New Activity'}</h1>
        <form onSubmit={handleSubmit} className="max-w-2xl bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 border border-light-border dark:border-dark-border rounded-lg shadow-sm space-y-4">
          <FormRow label="Activity Title" error={errors.title}>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary" />
          </FormRow>
          
          <FormRow label="Sport" error={errors.sportId}>
            <div className="relative" ref={sportDropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsSportDropdownOpen(prev => !prev)}
                    className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary text-left flex justify-between items-center"
                    aria-haspopup="listbox"
                    aria-expanded={isSportDropdownOpen}
                >
                    <span>{selectedSportForDisplay?.name || 'Select a sport'}</span>
                    <span className={`transform transition-transform duration-200 ${isSportDropdownOpen ? 'rotate-180' : ''}`}>
                        {ICONS.chevronDown}
                    </span>
                </button>
                {isSportDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                            <input
                                ref={sportSearchInputRef}
                                type="text"
                                placeholder="Search sports..."
                                value={sportSearch}
                                onChange={e => setSportSearch(e.target.value)}
                                className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <ul role="listbox">
                            {filteredSports.map(sport => (
                                <li
                                    key={sport.id}
                                    onClick={() => handleSelectSport(sport.id)}
                                    className="px-4 py-2 hover:bg-primary-light dark:hover:bg-dark-bg cursor-pointer"
                                    role="option"
                                    aria-selected={sportId === sport.id}
                                >
                                    {sport.name}
                                </li>
                            ))}
                            <li
                                onClick={() => handleSelectSport('other')}
                                className="px-4 py-2 hover:bg-primary-light dark:hover:bg-dark-bg cursor-pointer border-t border-light-border dark:border-dark-border"
                                role="option"
                                aria-selected={sportId === 'other'}
                            >
                                Other...
                            </li>
                        </ul>
                    </div>
                )}
            </div>
          </FormRow>
          
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOtherSport ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
               <FormRow label="Please Specify Sport" error={errors.otherSportName}>
                  <input type="text" value={otherSportName} onChange={e => setOtherSportName(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary" />
              </FormRow>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isOtherSport ? (
                  <>
                      <FormRow label="Activity Type (e.g., Casual Match)" error={errors.activityType}>
                          <input type="text" value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary" />
                      </FormRow>
                      <FormRow label="Level (e.g., Beginner)" error={errors.level}>
                          <input type="text" value={level} onChange={e => setLevel(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary" />
                      </FormRow>
                  </>
              ) : (
                  <>
                      <FormRow label="Activity Type" error={errors.activityType}>
                          <select value={activityType} onChange={e => setActivityType(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary" disabled={!selectedSport}>
                          {selectedSport?.activityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                      </FormRow>
                      <FormRow label="Level" error={errors.level}>
                          <select value={level} onChange={e => setLevel(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary" disabled={!selectedSport}>
                          {selectedSport?.levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                          </select>
                      </FormRow>
                  </>
              )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormRow label="Date and Time" error={errors.dateTime}>
              <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary" />
            </FormRow>
            <FormRow label="Partners Needed (0 for unlimited)" error={errors.partnersNeeded}>
                <input type="number" value={partnersNeeded} onChange={e => setPartnersNeeded(e.target.value)} min="0" className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary" />
            </FormRow>
          </div>
          
          <FormRow label="Location" error={errors.locationName}>
            <div className="p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md flex justify-between items-center">
                <p className="text-sm text-light-text dark:text-dark-text truncate pr-4">
                    {locationName || 'No location selected'}
                </p>
                <button type="button" onClick={() => setIsMapOpen(true)} className="px-4 py-1 bg-primary text-white text-sm font-semibold whitespace-nowrap rounded-md">Select on Map</button>
            </div>
          </FormRow>

          <div className="pt-4 flex gap-4">
              <button type="button" onClick={() => { setActivityToEdit(null); setCurrentPage(isEditing ? Page.MyActivities : Page.Home); }} className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 font-semibold px-4 py-3 transition-colors rounded-md" disabled={isSubmitting}>
                  Cancel
              </button>
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-3 flex items-center justify-center gap-2 transition-colors rounded-md disabled:bg-gray-400" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Activity')}
              </button>
          </div>
        </form>
      </div>
    </>
  );
};