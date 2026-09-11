import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as {
      username?: string
      password?: string
    }

    if (
      username !== process.env.ADMIN_PANEL_USERNAME ||
      password !== process.env.ADMIN_PANEL_PASSWORD
    ) {
      return NextResponse.json({ error: 'Incorrect username or password.' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to sign in.' }, { status: 400 })
  }
}