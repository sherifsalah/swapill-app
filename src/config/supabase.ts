import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://osmcorskrooeciiynmew.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbWNvcnNrcm9vZWNpaXlubWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDEyMDYsImV4cCI6MjA5Mjg3NzIwNn0.oUACzHwsOwWmLQ2VsLRabfZ3g7lhpwvUuOrku_EO_es';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
