
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = 'https://slpvhmrhsrftsbygboxi.supabase.co';
const supabaseAnonKey = 'sb_publishable_grq3G_V2WRUV6MxhVx1Ngw_ekkYVebO';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
