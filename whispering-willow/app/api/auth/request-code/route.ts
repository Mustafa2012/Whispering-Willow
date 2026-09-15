import { NextResponse } from 'next/server'
import { authHeaders, getSupabaseAuthUrl, isCustomerAuthConfigured } from '@/lib/customer-auth'

export async function POST(request: Request) {
  if (!isCustomerAuthConfigured()) return NextResponse.json({ error: 'Email OTP login is not configured yet.' }, { status: 503 })
  const { email } = await request.json() as { email?: string }
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail) return NextResponse.json({ error: 'An email address is required.' }, { status: 400 })
  const response = await fetch(getSupabaseAuthUrl('otp'), { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email: normalizedEmail, create_user: true }) })
  if (!response.ok) return NextResponse.json({ error: 'Unable to send the one-time code.' }, { status: 400 })
  return NextResponse.json({ success: true })
}