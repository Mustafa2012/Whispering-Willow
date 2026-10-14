import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const adminSessionCookie = 'whispering-willow-admin-session'
export const mainAdminEmail = 'mustafaali192012@gmail.com'
const adminSessionLifetimeSeconds = 60 * 60 * 12

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function adminEmailTableUrl() {
  if (!supabaseUrl) throw new Error('Admin email database is not configured.')
  return `${supabaseUrl}/rest/v1/admin_emails`
}

function adminEmailDatabaseHeaders() {
  if (!serviceRoleKey) throw new Error('Admin email database is not configured.')
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }
}

function signAdminSession(payload: string) {
  if (!serviceRoleKey) throw new Error('Admin session signing is not configured.')
  return createHmac('sha256', serviceRoleKey).update(payload).digest('base64url')
}

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase()
}

export function isValidAdminEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function getAllowedAdminEmails() {
  const response = await fetch(`${adminEmailTableUrl()}?select=email&order=email.asc`, {
    headers: adminEmailDatabaseHeaders(),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Unable to load authorized admin emails.')
  return (await response.json() as Array<{ email: string }>)
    .map((row) => row.email)
    .filter((email) => normalizeAdminEmail(email) !== mainAdminEmail)
}

export async function isAllowedAdminEmail(email: string) {
  const normalizedEmail = normalizeAdminEmail(email)
  if (normalizedEmail === mainAdminEmail) return true

  const query = new URLSearchParams({ select: 'email', email: `eq.${normalizedEmail}`, limit: '1' })
  const response = await fetch(`${adminEmailTableUrl()}?${query}`, {
    headers: adminEmailDatabaseHeaders(),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Unable to verify admin email access.')
  const rows = await response.json() as Array<{ email: string }>
  return rows.length > 0
}

export async function createAdminSession(email: string) {
  const payload = Buffer.from(JSON.stringify({
    email: normalizeAdminEmail(email),
    expiresAt: Date.now() + adminSessionLifetimeSeconds * 1000,
  })).toString('base64url')
  return `${payload}.${signAdminSession(payload)}`
}

async function getAdminSessionEmail() {
  const cookie = (await cookies()).get(adminSessionCookie)?.value
  if (!cookie) return null

  const [payload, signature, extra] = cookie.split('.')
  if (!payload || !signature || extra) return null

  const expectedSignature = signAdminSession(payload)
  const providedSignature = Buffer.from(signature)
  const expectedSignatureBytes = Buffer.from(expectedSignature)
  if (
    providedSignature.length !== expectedSignatureBytes.length ||
    !timingSafeEqual(providedSignature, expectedSignatureBytes)
  ) return null

  let session: { email?: unknown; expiresAt?: unknown }
  try {
    session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (
    typeof session.email !== 'string' ||
    typeof session.expiresAt !== 'number' ||
    session.expiresAt <= Date.now()
  ) return null

  return session.email
}

export async function isAdminRequest(request: Request) {
  const adminPassword = process.env.ADMIN_PANEL_PASSWORD
  if (adminPassword && request.headers.get('x-admin-password') === adminPassword) return true

  const email = await getAdminSessionEmail()
  return email ? isAllowedAdminEmail(email) : false
}

export function getAdminEmailDatabaseRequest() {
  return { url: adminEmailTableUrl(), headers: adminEmailDatabaseHeaders() }
}
