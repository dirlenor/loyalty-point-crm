import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnzalzpkjdtlqozwlurr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuemFsenBramR0bHFvendsdXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTk3NDcsImV4cCI6MjA4MjczNTc0N30.LLWPZfO0gpGBtgYZwpCxs8y6nLfbBjJZmjDpOfugJ58';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

