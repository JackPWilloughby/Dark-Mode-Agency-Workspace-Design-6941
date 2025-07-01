import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bstmdpqrlpdsckicniip.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzdG1kcHFybHBkc2NraWNuaWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNTU3MDksImV4cCI6MjA2NjkzMTcwOX0.euw5W6783F0TyqZUnMS0Z-4auyiq-MP4fiLvWNgJP1I'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})

console.log('🔗 Supabase client initialized')
console.log('📍 Environment: Development Mode')
console.log('🔄 Auth flow: Simplified (no email confirmation)')