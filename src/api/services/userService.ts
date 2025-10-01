import { supabase } from '../supabaseClient';
import { User } from '../../shared/types';

const transformProfileToUser = (profile: any): User => ({
    id: profile.id,
    name: profile.name,
    avatarUrl: profile.avatar_url,
    isAdmin: profile.is_admin,
    viewRadius: profile.view_radius,
    homeLocation: profile.home_location,
    isDeactivated: profile.is_deactivated,
});

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    // Map snake_case from DB to camelCase in User type
    return data.map(transformProfileToUser);
  },
  
  getUserProfile: async (userId: string): Promise<Omit<User, 'id' | 'email' | 'currentLocation'> | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
    }
    return data ? transformProfileToUser(data) : null;
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
    return transformProfileToUser(data);
  },

  setUserDeactivationStatus: async (userId: string, isDeactivated: boolean): Promise<User> => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_deactivated: isDeactivated })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return transformProfileToUser(data);
  },

  isUserDeactivatedByEmail: async (email: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('get_user_deactivation_status', {
      user_email: email
    });

    if (error) {
        // This can happen if the user doesn't exist, which is not an error in this context.
        if (error.code !== 'PGRST204') { // PGRST204 = No Content/Not Found
             console.error("Error checking user deactivation status:", error);
        }
        return false; // Fail safe: assume not deactivated if RPC fails or user not found
    }
    return data === true;
  },
};