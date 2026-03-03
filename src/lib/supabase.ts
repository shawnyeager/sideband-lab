import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_MAP_URL;
const key = import.meta.env.PUBLIC_SUPABASE_MAP_ANON_KEY;

export const mapClient = url && key ? createClient(url, key) : null;
