import { NextResponse } from 'next/server'
import { customerSessionCookie, getSupabaseAuthUrl, isCustomerAuthConfigured } from '@/lib/customer-auth'

export async function POST(request: Request) {
  if (!isCustomerAuthConfigured()) {
    return NextResponse.json({ error: 'Customer authentication is not configured.' }, { status: 503 })
  }

  const authorization = request.headers.get('authorization')
  if (!authorization) return NextResponse.json({ error: 'Missing customer session.' }, { status: 401 })

  const response = await fetch(getSupabaseAuthUrl('user'), {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY!,
      Authorization: authorization,
    },
    cache: 'no-store',
  })
  if (!response.ok) return NextResponse.json({ error: 'Invalid customer session.' }, { status: 401 })

  const result = NextResponse.json({ authenticated: true })
  result.cookies.set(customerSessionCookie, authorization.replace(/^Bearer\s+/i, ''), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  })
  return result
}
