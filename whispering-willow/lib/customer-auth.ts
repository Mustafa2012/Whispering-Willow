import { cookies } from 'next/headers'

export const customerSessionCookie = 'whispering-willow-customer-session'

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export function isCustomerAuthConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export async function getCustomerSession() {
  const token = (await cookies()).get(customerSessionCookie)?.value
  if (!token || !supabaseUrl || !supabaseAnonKey) return null
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` }, cache: 'no-store' })
  if (!response.ok) return null
  return await response.json() as { id: string; email?: string }
}

export function authHeaders() {
  return { apikey: supabaseAnonKey!, 'Content-Type': 'application/json' }
}

export function getSupabaseAuthUrl(path: string) {
  return `${supabaseUrl}/auth/v1/${path}`
}