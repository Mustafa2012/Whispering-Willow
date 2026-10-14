import { NextResponse } from 'next/server'
import { authHeaders, getSupabaseAuthUrl } from '@/lib/customer-auth'
import { adminSessionCookie, createAdminSession, isAllowedAdminEmail } from '@/lib/admin-auth'

export async function POST(request: Request) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Google admin sign-in is not configured.' }, { status: 503 })
  }

  let accessToken: unknown
  try {
    accessToken = (await request.json() as { accessToken?: unknown }).accessToken
  } catch {
    return NextResponse.json({ error: 'Unable to verify your Google sign-in.' }, { status: 400 })
  }
  if (typeof accessToken !== 'string' || accessToken.length > 4096) {
    return NextResponse.json({ error: 'Unable to verify your Google sign-in.' }, { status: 400 })
  }

  const userResponse = await fetch(getSupabaseAuthUrl('user'), {
    headers: {
      ...authHeaders(),
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })
  if (!userResponse.ok) {
    return NextResponse.json({ error: 'Your Google sign-in is invalid or expired.' }, { status: 401 })
  }

  const user = await userResponse.json() as { email?: unknown; email_confirmed_at?: unknown }
  if (
    typeof user.email !== 'string' ||
    !user.email_confirmed_at ||
    !(await isAllowedAdminEmail(user.email))
  ) {
    return NextResponse.json({ error: 'This Google account is not authorized for admin access.' }, { status: 403 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(adminSessionCookie, await createAdminSession(user.email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12,
    path: '/',
  })
  return response
}
