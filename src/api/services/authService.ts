import { supabase } from '../supabaseClient';

export const authService = {
  login: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signup: async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });
    if (error) throw error;

    // Supabase's signUp doesn't throw an error for an existing, confirmed user.
    // Instead, it returns a user object with an empty `identities` array.
    // We must check for this case to prevent showing a success message to an existing user.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('User with this email already exists. Please login.');
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  sendPasswordResetEmail: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // Redirects to the app's homepage after reset
    });
    if (error) throw error;
  },
};