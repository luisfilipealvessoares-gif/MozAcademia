
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = 'https://slpvhmrhsrftsbygboxi.supabase.co';

// This is the public anonymous key for your project.
// The "Invalid API Key" error was happening because the previous key was wrong.
// This is the correct key you provided.
const supabaseAnonKey = 'sb_publishable_grq3G_V2WRUV6MxhVx1Ngw_ekkYVebO';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
