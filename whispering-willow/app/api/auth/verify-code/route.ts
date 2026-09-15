import { NextResponse } from 'next/server'
import { authHeaders, customerSessionCookie, getSupabaseAuthUrl, isCustomerAuthConfigured } from '@/lib/customer-auth'

export async function POST(request: Request) {
  if (!isCustomerAuthConfigured()) return NextResponse.json({ error: 'Email OTP login is not configured yet.' }, { status: 503 })
  const { email, code } = await request.json() as { email?: string; code?: string }
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail || !code?.trim()) return NextResponse.json({ error: 'Email and login code are required.' }, { status: 400 })
  const response = await fetch(getSupabaseAuthUrl('verify'), { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email: normalizedEmail, token: code.trim(), type: 'email' }) })
  if (!response.ok) return NextResponse.json({ error: 'That code is invalid or has expired.' }, { status: 401 })
  const session = await response.json() as { access_token?: string; expires_in?: number }
  if (!session.access_token) return NextResponse.json({ error: 'Unable to start your session.' }, { status: 500 })
  const result = NextResponse.json({ success: true })
  result.cookies.set(customerSessionCookie, session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: session.expires_in || 3600, path: '/' })
  return result
}