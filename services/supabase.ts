
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = 'https://slpvhmrhsrftsbygboxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNscHZobXJoc3JmdHNieWdib3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4MjM0ODgsImV4cCI6MjAzMjM5OTQ4OH0.grq3G_V2WRUV6MxhVx1Ngw_ekkYVebO-G1o2r0W1dE0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
