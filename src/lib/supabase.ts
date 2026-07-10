import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export type Profile = {
  id: string
  name: string
  email: string
  phone: string
  role: 'Staff' | 'Vendor'
  tier?: 'Expert' | 'Senior' | 'Junior'
  company?: string
  service?: string
  created_at: string
}
