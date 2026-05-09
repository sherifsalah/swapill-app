import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ukxnvojogzacdtvahgvu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_IqmPJNTjejMYuAqjiLdvjw_3oHRCENr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
