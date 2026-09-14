import { NextResponse } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function unauthorized(request: Request) {
  return !process.env.ADMIN_PANEL_PASSWORD || request.headers.get('x-admin-password') !== process.env.ADMIN_PANEL_PASSWORD
}

export async function GET(request: Request) {
  if (unauthorized(request) || !supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const response = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&order=created_at.desc`, { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` }, cache: 'no-store' })
  if (!response.ok) return NextResponse.json({ error: 'Unable to load orders.' }, { status: 500 })
  return NextResponse.json(await response.json())
}

export async function PATCH(request: Request) {
  if (unauthorized(request) || !supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const { id, status, notes } = await request.json() as { id?: number; status?: string; notes?: string }
  const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled']
  if (!Number.isInteger(id) || !status || !allowedStatuses.includes(status)) return NextResponse.json({ error: 'Invalid order update.' }, { status: 400 })
  const response = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${id}`, { method: 'PATCH', headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status, admin_notes: notes?.trim() || null }) })
  if (!response.ok) return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 })
  return NextResponse.json({ success: true })
}