import { NextResponse } from 'next/server'
import { authHeaders, customerSessionCookie, getSupabaseAuthUrl, isCustomerAuthConfigured } from '@/lib/customer-auth'

export async function GET(request: Request) {
  const loginUrl = new URL('/login', request.url)
  if (!isCustomerAuthConfigured()) {
    loginUrl.searchParams.set('error', 'Email login is not configured yet.')
    return NextResponse.redirect(loginUrl)
  }

  const callbackUrl = new URL(request.url)
  const token = callbackUrl.searchParams.get('token_hash') || callbackUrl.searchParams.get('token')
  if (!token) {
    loginUrl.searchParams.set('error', 'This sign-in link is invalid or incomplete.')
    return NextResponse.redirect(loginUrl)
  }

  const response = await fetch(getSupabaseAuthUrl('verify'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ token, type: 'magiclink' }),
  })
  if (!response.ok) {
    loginUrl.searchParams.set('error', 'This sign-in link is invalid or has expired.')
    return NextResponse.redirect(loginUrl)
  }

  const session = await response.json() as { access_token?: string; expires_in?: number }
  if (!session.access_token) {
    loginUrl.searchParams.set('error', 'Unable to start your session.')
    return NextResponse.redirect(loginUrl)
  }

  const result = NextResponse.redirect(new URL('/orders', request.url))
  result.cookies.set(customerSessionCookie, session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: session.expires_in || 3600,
    path: '/',
  })
  return result
}
