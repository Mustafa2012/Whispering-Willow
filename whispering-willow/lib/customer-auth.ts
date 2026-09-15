import { cookies } from 'next/headers'

export const customerSessionCookie = 'whispering-willow-customer-session'

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export function isCustomerAuthConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export type CustomerUser = {
  id: string
  email?: string
  user_metadata?: {
    avatar_url?: string
    picture?: string
  }
}

export async function getCustomerSession(request?: Request) {
  const cookieStore = await cookies()
  const customToken = cookieStore.get(customerSessionCookie)?.value
  const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : null
  const supabaseAuthToken = projectRef ? cookieStore.get(`sb-${projectRef}-auth-token`)?.value : null
  const authorizationToken = request?.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null

  let token = authorizationToken || customToken || null
  if (!token && supabaseAuthToken) {
    try {
      const parsed = JSON.parse(supabaseAuthToken)
      if (Array.isArray(parsed)) {
        token = parsed[0]?.access_token || parsed[0]?.token || null
      } else {
        token = parsed.access_token || parsed.token || null
      }
    } catch {
      token = supabaseAuthToken
    }
  }

  if (!token || !supabaseUrl || !supabaseAnonKey) return null
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` }, cache: 'no-store' })
  if (!response.ok) return null
  return await response.json() as CustomerUser
}

export function authHeaders() {
  return { apikey: supabaseAnonKey!, 'Content-Type': 'application/json' }
}

export function getSupabaseAuthUrl(path: string) {
  return `${supabaseUrl}/auth/v1/${path}`
}