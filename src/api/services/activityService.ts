import { supabase } from '../supabaseClient';
import { Activity, Sport } from '../../shared/types';

type ActivityData = Omit<Activity, 'id' | 'creatorId' | 'participants'>;

// Helper to transform Supabase activity data to application's Activity type
const transformActivity = (activity: any): Activity => ({
  id: activity.id,
  sportId: activity.sport_id,
  otherSportName: activity.other_sport_name,
  title: activity.title,
  creatorId: activity.creator_id,
  dateTime: new Date(activity.date_time),
  locationName: activity.location_name,
  locationCoords: activity.location_coords,
  activityType: activity.activity_type,
  level: activity.level,
  partnersNeeded: activity.partners_needed,
  participants: activity.participants.map((p: any) => p.user_id),
});


export const activityService = {
  getActivities: async (): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('activities')
      .select(`*, participants:activity_participants(user_id)`)
      .order('date_time', { ascending: false });

    if (error) throw error;
    return data.map(transformActivity);
  },

  createActivity: async (newActivityData: ActivityData, creatorId: string): Promise<Activity> => {
    // 1. Insert the activity
    const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .insert({
            sport_id: newActivityData.sportId || null,
            other_sport_name: newActivityData.otherSportName,
            title: newActivityData.title,
            creator_id: creatorId,
            date_time: newActivityData.dateTime.toISOString(),
            location_name: newActivityData.locationName,
            location_coords: newActivityData.locationCoords,
            activity_type: newActivityData.activityType,
            level: newActivityData.level,
            partners_needed: newActivityData.partnersNeeded,
        })
        .select()
        .single();
    
    if (activityError) throw activityError;

    // 2. Add creator to participants list
    const { error: participantError } = await supabase
        .from('activity_participants')
        .insert({ activity_id: activityData.id, user_id: creatorId });
    
    if (participantError) {
      // If adding participant fails, attempt to roll back activity creation for consistency
      await supabase.from('activities').delete().eq('id', activityData.id);
      throw participantError;
    }
    
    // Fetch the complete activity object to return
    const { data: finalActivity, error: finalError } = await supabase
      .from('activities')
      .select(`*, participants:activity_participants(user_id)`)
      .eq('id', activityData.id)
      .single();

    if (finalError) throw finalError;

    return transformActivity(finalActivity);
  },

  updateActivity: async (activityId: string, updates: Partial<ActivityData>): Promise<Activity> => {
    const { data, error } = await supabase
      .from('activities')
      .update({
            sport_id: updates.sportId,
            other_sport_name: updates.otherSportName,
            title: updates.title,
            date_time: updates.dateTime?.toISOString(),
            location_name: updates.locationName,
            location_coords: updates.locationCoords,
            activity_type: updates.activityType,
            level: updates.level,
            partners_needed: updates.partnersNeeded,
      })
      .eq('id', activityId)
      .select(`*, participants:activity_participants(user_id)`)
      .single();

    if (error) throw error;
    return transformActivity(data);
  },

  joinActivity: async (activityId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('activity_participants')
      .insert({ activity_id: activityId, user_id: userId });
    if (error) throw error;
  },

  leaveActivity: async (activityId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('activity_participants')
      .delete()
      .match({ activity_id: activityId, user_id: userId });
    if (error) throw error;
  },

  deleteActivity: async (activityId: string): Promise<string> => {
    const { error } = await supabase.from('activities').delete().eq('id', activityId);
    if (error) throw error;
    return activityId;
  },
  
  getSports: async (): Promise<Sport[]> => {
    const { data, error } = await supabase.from('sports').select('*');
    if (error) throw error;
    return data.map(sport => ({
        id: sport.id,
        name: sport.name,
        isTeamSport: sport.is_team_sport,
        activityTypes: sport.activity_types,
        levels: sport.levels
    }));
  }
};
