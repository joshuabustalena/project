import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrrstxvlmcikgjhstzzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlycnN0eHZsbWNpa2dqaHN0enpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzI1MDYsImV4cCI6MjA4MzEwODUwNn0.OiRJFphlHKJrQokP41sqFvq_jL7WpS7DHuVLJLnKXLM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
