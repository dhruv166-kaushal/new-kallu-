import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nzdngpirdhevgzjarezv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZG5ncGlyZGhldmd6amFyZXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTM2MTQsImV4cCI6MjA4MDg2OTYxNH0.dZLY4xBwVZ4Nv8omCDN00IDBXR3FCbAMC8l5emks_ZE';

export const supabase = createClient(supabaseUrl, supabaseKey);