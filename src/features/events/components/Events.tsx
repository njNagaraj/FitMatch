import React, { useState, useMemo } from 'react';
import { Event } from '../../../shared/types';
import { EventForm } from './EventForm';
import { ICONS } from '../../../shared/constants';
import { EventCard } from './EventCard';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useModal } from '../../../shared/contexts/ModalContext';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

export const Events: React.FC = () => {
  const { events, createEvent, updateEvent, deleteEvent, loading } = useEvents();
  const { isAdmin } = useAuth();
  const [cityFilter, setCityFilter] = useState('All Cities');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const cities = useMemo(() => ['All Cities', ...Array.from(new Set(events.map(e => e.city)))], [events]);

  const filteredEvents = useMemo(() => {
    if (cityFilter === 'All Cities') return events;
    return events.filter(event => event.city === cityFilter);
  }, [cityFilter, events]);

  const handleCreate = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  const handleSave = async (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, eventData);
    } else {
      await createEvent(eventData);
    }
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  return (
    <>
      <EventForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        eventToEdit={editingEvent}
      />
      <div className="p-4 sm:p-8 h-full overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Upcoming Events</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="w-full p-2 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-md focus:ring-primary focus:border-primary">
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
            </div>
            {isAdmin && (
                <button onClick={handleCreate} className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 flex items-center justify-center gap-2 transition-colors rounded-md">
                    {ICONS.create} Create New Event
                </button>
            )}
          </div>
        </div>
        
        <div data-tour-id="events-list">
            {loading ? (
                <LoadingSpinner message="Loading upcoming events..." />
            ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                <EventCard 
                    key={event.id} 
                    event={event} 
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
                ))}
            </div>
            ) : (
            <p className="text-center py-10 text-light-text-secondary dark:text-dark-text-secondary">No events found for the selected city.</p>
            )}
        </div>
      </div>
    </>
  );
};