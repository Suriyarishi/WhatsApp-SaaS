import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cigluwcdnipklfbqfmuk.supabase.co'
const supabaseKey = 'sb_publishable_RKbXb5zh7HsqSftreZZJlA_5Ffu6WJ6'

// Guard against placeholder values to prevent white-screen crashes
const isConfigured =
    supabaseUrl.startsWith('https://') &&
    supabaseKey.startsWith('sb_')

// A "Safe" mock that prevents crashes but returns empty results
const mockSupabase = {
    auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: {}, error: { message: "Supabase not configured" } }),
        signInWithPassword: async () => ({ data: {}, error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
        updateUser: async () => ({ error: { message: "Supabase not configured" } })
    },
    from: () => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: null, error: null }),
                eq: () => ({ count: 0, error: null }),
                order: () => ({ limit: () => ({ data: [], error: null }), data: [], error: null })
            }),
            order: () => ({ data: [], error: null })
        }),
        upsert: async () => ({ error: { message: "Supabase not configured" } })
    })
};

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseKey)
    : mockSupabase;
