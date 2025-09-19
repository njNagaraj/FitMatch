import React, { useState, useEffect } from 'react';
import { Event } from '../types';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<Event, 'id'>) => void;
  eventToEdit: Event | null;
}

const FormRow: React.FC<{ label: string; children: React.ReactNode; error?: string }> = ({ label, children, error }) => (
  <div>
    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Helper to format date for datetime-local input
const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};


export const EventForm: React.FC<EventFormProps> = ({ isOpen, onClose, onSave, eventToEdit }) => {
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setSport(eventToEdit.sport);
      setCity(eventToEdit.city);
      setDate(formatDateForInput(eventToEdit.date));
      setDescription(eventToEdit.description);
      setImageUrl(eventToEdit.imageUrl);
      setRegistrationUrl(eventToEdit.registrationUrl);
    } else {
      // Reset form for new event
      setTitle('');
      setSport('');
      setCity('');
      setDate('');
      setDescription('');
      setImageUrl('');
      setRegistrationUrl('');
    }
    setErrors({}); // Clear errors when modal opens or event changes
  }, [eventToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!sport.trim()) newErrors.sport = 'Sport is required.';
    if (!city.trim()) newErrors.city = 'City is required.';
    if (!date) newErrors.date = 'Date is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!imageUrl.trim()) newErrors.imageUrl = 'Image URL is required.';
    else if (!/^https?:\/\/.+/.test(imageUrl)) newErrors.imageUrl = 'Please enter a valid URL.';
    if (!registrationUrl.trim()) newErrors.registrationUrl = 'Registration URL is required.';
    else if (!/^https?:\/\/.+/.test(registrationUrl)) newErrors.registrationUrl = 'Please enter a valid URL.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      title,
      sport,
      city,
      date: new Date(date),
      description,
      imageUrl,
      registrationUrl,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary w-full max-w-lg max-h-[90vh] flex flex-col border border-light-border dark:border-dark-border">
        <header className="p-4 border-b border-light-border dark:border-dark-border flex-shrink-0 flex justify-between items-center">
          <h2 className="text-lg font-bold">{eventToEdit ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={onClose} className="text-2xl font-bold p-1 leading-none" aria-label="Close">&times;</button>
        </header>
        <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-4 overflow-y-auto">
            <FormRow label="Event Title" error={errors.title}>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
            </FormRow>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Sport" error={errors.sport}>
                    <input type="text" value={sport} onChange={e => setSport(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
                </FormRow>
                <FormRow label="City" error={errors.city}>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
                </FormRow>
            </div>
            
            <FormRow label="Date and Time" error={errors.date}>
                <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
            </FormRow>

            <FormRow label="Description" error={errors.description}>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary"></textarea>
            </FormRow>

            <FormRow label="Image URL" error={errors.imageUrl}>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
            </FormRow>

            <FormRow label="Registration URL" error={errors.registrationUrl}>
                <input type="url" value={registrationUrl} onChange={e => setRegistrationUrl(e.target.value)} placeholder="https://example.com/register" className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
            </FormRow>
        </form>
        <footer className="p-4 border-t border-light-border dark:border-dark-border flex justify-end gap-4 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white font-semibold transition-colors hover:bg-primary-dark">{eventToEdit ? 'Save Changes' : 'Create Event'}</button>
        </footer>
      </div>
    </div>
  );
};