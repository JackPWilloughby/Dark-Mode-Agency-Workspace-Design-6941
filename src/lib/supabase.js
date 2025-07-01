import { createClient } from '@supabase/supabase-js'

// Project credentials
const SUPABASE_URL = 'https://frjeflxlxsvzzbydcwgh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyamVmbHhseHN2enpieWRjd2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNzAxNDQsImV4cCI6MjA2Njk0NjE0NH0.5ws3rZ1RHxYmVcUFjJU34aX03Ky3dc11q1xlYwjk40k'

if(SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})