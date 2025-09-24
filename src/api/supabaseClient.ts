import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

// FIX: Removed a check for placeholder Supabase credentials. This check caused a TypeScript error
// because the config values in `src/config.ts` are hardcoded, making the comparison always false.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
