import { NextResponse } from 'next/server'

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