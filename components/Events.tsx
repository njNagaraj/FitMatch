import React, { useState, useMemo } from 'react';
import { FitMatchData } from '../useFitMatchData';
import { Event } from '../types';

const EventCard: React.FC<{ event: Event }> = ({ event }) => (
  <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border overflow-hidden flex flex-col">
    <img src={event.imageUrl} alt={event.title} className="w-full h-40 object-cover" />
    <div className="p-4 flex flex-col flex-grow">
      <p className="text-sm font-semibold text-primary">{event.sport} - {event.city}</p>
      <h3 className="text-lg font-bold text-light-text dark:text-dark-text mt-1">{event.title}</h3>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary my-2 flex-grow">{event.description}</p>
      <p className="text-sm font-medium text-light-text dark:text-dark-text mb-4">
        {new Date(event.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="mt-auto block text-center w-full bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 transition-colors">
        Register Now
      </a>
    </div>
  </div>
);

export const Events: React.FC<{ data: FitMatchData }> = ({ data }) => {
  const { events } = data;
  const [cityFilter, setCityFilter] = useState('All Cities');

  const cities = useMemo(() => ['All Cities', ...Array.from(new Set(events.map(e => e.city)))], [events]);

  const filteredEvents = useMemo(() => {
    if (cityFilter === 'All Cities') return events;
    return events.filter(event => event.city === cityFilter);
  }, [cityFilter, events]);

  return (
    <div className="p-4 sm:p-8 h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4 sm:mb-0">Upcoming Events</h1>
        <div className="w-full sm:w-48">
           <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="w-full p-2 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary">
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
        </div>
      </div>
      
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-center py-10 text-light-text-secondary dark:text-dark-text-secondary">No events found for the selected city.</p>
      )}
    </div>
  );
};
