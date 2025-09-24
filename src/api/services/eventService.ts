import { supabase } from '../supabaseClient';
import { Event } from '../../shared/types';

type EventData = Omit<Event, 'id'>;

const transformEvent = (event: any): Event => ({
    id: event.id,
    title: event.title,
    sport: event.sport,
    city: event.city,
    date: new Date(event.date),
    description: event.description,
    imageUrl: event.image_url,
    registrationUrl: event.registration_url,
});

export const eventService = {
  getEvents: async (): Promise<Event[]> => {
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (error) throw error;
    return data.map(transformEvent);
  },

  createEvent: async (eventData: EventData): Promise<Event> => {
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        sport: eventData.sport,
        city: eventData.city,
        date: eventData.date.toISOString(),
        description: eventData.description,
        image_url: eventData.imageUrl,
        registration_url: eventData.registrationUrl,
      })
      .select()
      .single();
    if (error) throw error;
    return transformEvent(data);
  },

  updateEvent: async (eventId: string, updatedData: EventData): Promise<Event> => {
    const { data, error } = await supabase
      .from('events')
      .update({
        title: updatedData.title,
        sport: updatedData.sport,
        city: updatedData.city,
        date: updatedData.date.toISOString(),
        description: updatedData.description,
        image_url: updatedData.imageUrl,
        registration_url: updatedData.registrationUrl,
      })
      .eq('id', eventId)
      .select()
      .single();
      
    if (error) throw error;
    return transformEvent(data);
  },

  deleteEvent: async (eventId: string): Promise<string> => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;
    return eventId;
  },
};
