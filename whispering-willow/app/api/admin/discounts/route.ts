import { NextResponse } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function unauthorized(request: Request) {
  return !process.env.ADMIN_PANEL_PASSWORD || request.headers.get('x-admin-password') !== process.env.ADMIN_PANEL_PASSWORD
}

function adminHeaders() {
  return { apikey: serviceRoleKey!, Authorization: `Bearer ${serviceRoleKey!}`, 'Content-Type': 'application/json' }
}

export async function GET(request: Request) {
  if (unauthorized(request) || !supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const response = await fetch(`${supabaseUrl}/rest/v1/discount_codes?select=*&order=created_at.desc`, { headers: adminHeaders(), cache: 'no-store' })
  if (!response.ok) return NextResponse.json({ error: 'Unable to load discount codes.' }, { status: 500 })
  return NextResponse.json(await response.json())
}

export async function POST(request: Request) {
  if (unauthorized(request) || !supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const body = await request.json() as { code?: string; discountType?: string; value?: number; expiresAt?: string; usageLimit?: number | null }
  const code = body.code?.trim().toUpperCase()
  const value = Number(body.value)
  if (!code || !/^[A-Z0-9_-]{3,30}$/.test(code) || !['percentage', 'fixed'].includes(body.discountType || '') || !Number.isFinite(value) || value <= 0 || (body.discountType === 'percentage' && value > 100)) {
    return NextResponse.json({ error: 'Enter a valid code, discount type, and value.' }, { status: 400 })
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/discount_codes`, { method: 'POST', headers: { ...adminHeaders(), Prefer: 'return=representation' }, body: JSON.stringify({ code, discount_type: body.discountType, value, expires_at: body.expiresAt || null, usage_limit: body.usageLimit ? Math.floor(body.usageLimit) : null }) })
  if (!response.ok) return NextResponse.json({ error: 'Unable to create discount code. The code may already exist.' }, { status: 400 })
  return NextResponse.json((await response.json())[0], { status: 201 })
}

export async function PATCH(request: Request) {
  if (unauthorized(request) || !supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const body = await request.json() as { id?: number; isActive?: boolean }
  if (!Number.isInteger(body.id) || typeof body.isActive !== 'boolean') return NextResponse.json({ error: 'Invalid discount code update.' }, { status: 400 })
  const response = await fetch(`${supabaseUrl}/rest/v1/discount_codes?id=eq.${body.id}`, { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ is_active: body.isActive }) })
  if (!response.ok) return NextResponse.json({ error: 'Unable to update discount code.' }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  if (unauthorized(request) || !supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid discount code.' }, { status: 400 })
  const response = await fetch(`${supabaseUrl}/rest/v1/discount_codes?id=eq.${id}`, { method: 'DELETE', headers: adminHeaders() })
  if (!response.ok) return NextResponse.json({ error: 'Unable to delete discount code.' }, { status: 500 })
  return NextResponse.json({ success: true })
}