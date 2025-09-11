import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uofwzjsokfuigryetnle.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvZnd6anNva2Z1aWdyeWV0bmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MTMyNDksImV4cCI6MjA3MzE4OTI0OX0.akyFdpQY3ozE7-EemXxAXgScvduMzUpItEqwiqzuK2M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
