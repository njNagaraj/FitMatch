import React from 'react';
import { Event } from '../../../shared/types';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  isAdmin: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isAdmin, onEdit, onDelete }) => (
  <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border overflow-hidden flex flex-col rounded-lg shadow-sm">
    <img src={event.imageUrl} alt={event.title} className="w-full h-40 object-cover" />
    <div className="p-4 flex flex-col flex-grow">
      <p className="text-sm font-semibold text-primary">{event.sport} - {event.city}</p>
      <h3 className="text-lg font-bold text-light-text dark:text-dark-text mt-1">{event.title}</h3>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary my-2 flex-grow">{event.description}</p>
      <p className="text-sm font-medium text-light-text dark:text-dark-text mb-4">
        {new Date(event.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <div className="mt-auto flex gap-2">
        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="flex-1 block text-center bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 transition-colors rounded-md">
            Register
        </a>
        {isAdmin && (
            <>
                <button onClick={() => onEdit(event)} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors rounded-md">Edit</button>
                <button onClick={() => onDelete(event.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors rounded-md">Delete</button>
            </>
        )}
      </div>
    </div>
  </div>
);
