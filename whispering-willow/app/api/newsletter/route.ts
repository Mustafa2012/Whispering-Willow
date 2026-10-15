import { NextResponse } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Newsletter signup is not configured yet.' }, { status: 503 })
  }

  let email: unknown
  try {
    email = (await request.json() as { email?: unknown }).email
  } catch {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (typeof email !== 'string') {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/newsletter_subscribers`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({ email: normalizedEmail }),
    })
    if (response.status === 404) {
      return NextResponse.json({ error: 'Newsletter signup is not set up yet. Run supabase/migrations/009_newsletter_subscribers.sql.' }, { status: 503 })
    }
    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to save your email. Please try again.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to save your email. Please try again.' }, { status: 503 })
  }
}
