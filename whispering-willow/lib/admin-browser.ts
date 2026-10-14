import { customerSupabase } from '@/lib/customer-browser'

export const adminSessionKey = 'whispering-willow-admin-authenticated'
export const adminPasswordSessionKey = 'whispering-willow-admin-password'

export async function hasAdminAccess() {
  const sessionPassword = sessionStorage.getItem(adminPasswordSessionKey)
  if (sessionStorage.getItem(adminSessionKey) === 'true' && sessionPassword) return true

  const response = await fetch('/api/admin/auth', { cache: 'no-store' })
  if (response.ok) {
    sessionStorage.setItem(adminSessionKey, 'true')
    return true
  }

  if (!customerSupabase) return false
  const { data, error } = await customerSupabase.auth.getSession()
  if (error) throw error
  const accessToken = data.session?.access_token
  if (!accessToken) return false

  const sessionResponse = await fetch('/api/admin/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  })
  if (!sessionResponse.ok) {
    if (sessionResponse.status === 401 || sessionResponse.status === 403) return false
    const result = await sessionResponse.json() as { error?: string }
    throw new Error(result.error || 'Unable to verify your signed-in account.')
  }

  sessionStorage.setItem(adminSessionKey, 'true')
  return true
}
