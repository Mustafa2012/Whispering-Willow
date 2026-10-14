import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: Request) {
  const adminUsername = process.env.ADMIN_PANEL_USERNAME
  const adminPassword = process.env.ADMIN_PANEL_PASSWORD

  if (!adminUsername || !adminPassword) {
    return NextResponse.json(
      { error: 'Admin login is not configured on this deployment.' },
      { status: 503 },
    )
  }

  try {
    const { username, password } = (await request.json()) as {
      username?: string
      password?: string
    }

    if (
      username !== adminUsername ||
      password !== adminPassword
    ) {
      return NextResponse.json({ error: 'Incorrect username or password.' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to sign in.' }, { status: 400 })
  }
}