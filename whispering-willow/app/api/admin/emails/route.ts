import { NextResponse } from 'next/server'
import {
  getAdminEmailDatabaseRequest,
  getAllowedAdminEmails,
  isAdminRequest,
  isValidAdminEmail,
  mainAdminEmail,
  normalizeAdminEmail,
} from '@/lib/admin-auth'

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    return NextResponse.json(await getAllowedAdminEmails(), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load authorized admin emails.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
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

  const normalizedEmail = normalizeAdminEmail(email)
  if (!isValidAdminEmail(normalizedEmail)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (normalizedEmail === mainAdminEmail) {
    return NextResponse.json({ error: 'That email already has permanent admin access.' }, { status: 409 })
  }

  try {
    const { url, headers } = getAdminEmailDatabaseRequest()
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ email: normalizedEmail }),
    })
    if (response.status === 409) {
      return NextResponse.json({ error: 'That email already has admin access.' }, { status: 409 })
    }
    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to add the admin email.' }, { status: 500 })
    }
    return NextResponse.json({ email: normalizedEmail }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to add the admin email.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const email = new URL(request.url).searchParams.get('email')
  const normalizedEmail = email ? normalizeAdminEmail(email) : ''
  if (!isValidAdminEmail(normalizedEmail)) {
    return NextResponse.json({ error: 'Choose a valid admin email to remove.' }, { status: 400 })
  }
  if (normalizedEmail === mainAdminEmail) {
    return NextResponse.json({ error: 'The main admin email cannot be removed.' }, { status: 403 })
  }

  try {
    const { url, headers } = getAdminEmailDatabaseRequest()
    const query = new URLSearchParams({ email: `eq.${normalizedEmail}` })
    const response = await fetch(`${url}?${query}`, {
      method: 'DELETE',
      headers: { ...headers, Prefer: 'return=minimal' },
    })
    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to remove the admin email.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to remove the admin email.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
