import { supabase } from '../supabaseClient';
import { User } from '../../shared/types';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    // Map snake_case from DB to camelCase in User type
    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      isAdmin: profile.is_admin,
      viewRadius: profile.view_radius,
      homeLocation: profile.home_location
    }));
  },
  
  getUserProfile: async (userId: string): Promise<Omit<User, 'id' | 'email' | 'currentLocation'> | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
    }
    return data ? {
        name: data.name,
        avatarUrl: data.avatar_url,
        isAdmin: data.is_admin,
        viewRadius: data.view_radius,
        homeLocation: data.home_location
    } : null;
  },

  updateUserProfile: async (userId: string, updatedData: Partial<Pick<User, 'name' | 'homeLocation' | 'viewRadius'>>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
          name: updatedData.name,
          home_location: updatedData.homeLocation,
          view_radius: updatedData.viewRadius
       })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return {
        name: data.name,
        avatarUrl: data.avatar_url,
        isAdmin: data.is_admin,
        viewRadius: data.view_radius,
        homeLocation: data.home_location
    };
  },

  deleteUser: async (userId: string): Promise<string> => {
    // Note: This only deletes the public profile. Deleting from auth.users
    // requires admin privileges not available with the anon key.
    // For a full user deletion, a Supabase Edge Function is recommended.
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    return userId;
  },
};
