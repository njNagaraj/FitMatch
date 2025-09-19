import React, { useState, useMemo } from 'react';
import { Event } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { EventForm } from './EventForm';
import { ICONS } from '../constants';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  isAdmin: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isAdmin, onEdit, onDelete }) => (
  <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border overflow-hidden flex flex-col">
    <img src={event.imageUrl} alt={event.title} className="w-full h-40 object-cover" />
    <div className="p-4 flex flex-col flex-grow">
      <p className="text-sm font-semibold text-primary">{event.sport} - {event.city}</p>
      <h3 className="text-lg font-bold text-light-text dark:text-dark-text mt-1">{event.title}</h3>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary my-2 flex-grow">{event.description}</p>
      <p className="text-sm font-medium text-light-text dark:text-dark-text mb-4">
        {new Date(event.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <div className="mt-auto flex gap-2">
        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="flex-1 block text-center bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 transition-colors">
            Register
        </a>
        {isAdmin && (
            <>
                <button onClick={() => onEdit(event)} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors">Edit</button>
                <button onClick={() => onDelete(event.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Delete</button>
            </>
        )}
      </div>
    </div>
  </div>
);

export const Events: React.FC = () => {
  const { events, isAdmin, createEvent, updateEvent, deleteEvent } = useAppContext();
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

  const handleDelete = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteEvent(eventId);
    }
  };

  const handleSave = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      createEvent(eventData);
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
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="w-full p-2 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary">
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
            </div>
            {isAdmin && (
                <button onClick={handleCreate} className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 flex items-center justify-center gap-2 transition-colors">
                    {ICONS.create} Create New Event
                </button>
            )}
          </div>
        </div>
        
        {filteredEvents.length > 0 ? (
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
    </>
  );
};