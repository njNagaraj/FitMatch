import { db } from '../mockDatabase';
import { Event } from '../../shared/types';

const SIMULATED_DELAY = 500;

export const eventService = {
  getEvents: async (): Promise<Event[]> => {
    console.log('API: Fetching all events...');
    return new Promise(resolve => setTimeout(() => resolve([...db.events].sort((a,b) => a.date.getTime() - b.date.getTime())), SIMULATED_DELAY));
  },

  createEvent: async (eventData: Omit<Event, 'id'>): Promise<Event> => {
    console.log('API: Creating event...');
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}`,
    };
    db.events.push(newEvent);
    return new Promise(resolve => setTimeout(() => resolve(newEvent), SIMULATED_DELAY));
  },

  updateEvent: async (eventId: string, updatedData: Omit<Event, 'id'>): Promise<Event> => {
    console.log(`API: Updating event ${eventId}...`);
    let updatedEvent: Event | undefined;
    db.events = db.events.map(event => {
      if (event.id === eventId) {
        updatedEvent = { id: eventId, ...updatedData };
        return updatedEvent;
      }
      return event;
    });

    if (updatedEvent) {
      return new Promise(resolve => setTimeout(() => resolve(updatedEvent!), SIMULATED_DELAY));
    } else {
      return Promise.reject(new Error('Event not found.'));
    }
  },

  deleteEvent: async (eventId: string): Promise<string> => {
    console.log(`API: Deleting event ${eventId}...`);
    const initialLength = db.events.length;
    db.events = db.events.filter(event => event.id !== eventId);
    if (db.events.length < initialLength) {
      return new Promise(resolve => setTimeout(() => resolve(eventId), SIMULATED_DELAY));
    } else {
      return Promise.reject(new Error('Event not found.'));
    }
  },
};
