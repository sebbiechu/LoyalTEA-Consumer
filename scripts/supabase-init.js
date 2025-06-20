// scripts/supabase-init.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://smvghvbutrewcyfcjerm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdmdodmJ1dHJld2N5ZmNqZXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjMxNjUsImV4cCI6MjA2NTg5OTE2NX0.BcrRQHEQpKRkv7yPBkJV4Pd9CLQ38ztQCefALpkefcA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
