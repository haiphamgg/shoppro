import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztoqbsvgfvvjagktdeif.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b3Fic3ZnZnZ2amFna3RkZWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDc1NDMsImV4cCI6MjA4MDUyMzU0M30.gqrYFtllEvtTOHQrQwu9934ad_MO3KrFWiPtt0tb-Gg';

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseKey);