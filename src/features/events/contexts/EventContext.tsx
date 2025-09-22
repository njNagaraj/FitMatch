import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Event } from '../../../shared/types';
import { eventService } from '../../../api/services/eventService';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useToast } from '../../../shared/contexts/ToastContext';

interface EventContextType {
  events: Event[];
  loading: boolean;
  createEvent: (eventData: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (eventId: string, updatedData: Omit<Event, 'id'>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const fetchEvents = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const fetchedEvents = await eventService.getEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      addToast("Could not load events.", "error");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, addToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      const newEvent = await eventService.createEvent(eventData);
      setEvents(prev => [...prev, newEvent].sort((a,b) => a.date.getTime() - b.date.getTime()));
      addToast('Event created successfully!', 'success');
    } catch (error) {
      addToast('Failed to create event.', 'error');
    }
  };

  const updateEvent = async (eventId: string, updatedData: Omit<Event, 'id'>) => {
    try {
      const updatedEvent = await eventService.updateEvent(eventId, updatedData);
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      addToast('Event updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update event.', 'error');
    }
  };

  const deleteEvent = async (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    try {
      await eventService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      addToast(`Event "${eventToDelete.title}" deleted.`, 'info');
    } catch (error) {
      addToast('Failed to delete event.', 'error');
    }
  };

  const value = {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
