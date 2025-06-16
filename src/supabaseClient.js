// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msamwyxvymrropifknom.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zYW13eXh2eW1ycm9waWZrbm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MDY5NzMsImV4cCI6MjA2NDk4Mjk3M30.UMIWDQREaE-FwLkIGQ6jvllHh18ag7lONB9fa9ay5Mk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
