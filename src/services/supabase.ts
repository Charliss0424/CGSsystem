import { createClient } from '@supabase/supabase-js';

// Reemplaza esto con los datos que copiaste en el Paso 1
const supabaseUrl = 'https://xplynrlixmbdxuikjlek.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbHlucmxpeG1iZHh1aWtqbGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Njg5MTUsImV4cCI6MjA4MDU0NDkxNX0.nTZmAT_vEQlHgNnjyjzLcmyDfi-ZVaBC4AUmFKNubuo';

export const supabase = createClient(supabaseUrl, supabaseKey);