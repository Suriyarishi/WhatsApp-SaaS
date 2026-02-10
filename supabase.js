import { createClient } from '@supabase/supabase-js'

// Read from Vite / Vercel environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// Hard fail if env vars are missing (better than silent bugs)
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing')
}

// Create real Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)
