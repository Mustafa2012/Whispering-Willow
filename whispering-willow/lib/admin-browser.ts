export const adminSessionKey = 'whispering-willow-admin-authenticated'
export const adminPasswordSessionKey = 'whispering-willow-admin-password'

export async function hasAdminAccess() {
  const sessionPassword = sessionStorage.getItem(adminPasswordSessionKey)
  if (sessionStorage.getItem(adminSessionKey) === 'true' && sessionPassword) return true

  const response = await fetch('/api/admin/auth', { cache: 'no-store' })
  if (!response.ok) return false
  sessionStorage.setItem(adminSessionKey, 'true')
  return true
}
