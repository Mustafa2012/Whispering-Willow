import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const pageSize = 1000

type SubscriberRow = { email?: string | null }
type OrderContactRow = { email?: string | null; phone?: string | null }
type ContactEmail = { email: string; newsletter: boolean; customer: boolean }

async function readRows<T>(table: string, columns: string, order: string): Promise<T[]> {
  const rows: T[] = []
  for (let offset = 0; ; offset += pageSize) {
    const query = new URLSearchParams({ select: columns, order })
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: serviceRoleKey!,
        Authorization: `Bearer ${serviceRoleKey}`,
        Range: `${offset}-${offset + pageSize - 1}`,
      },
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(table === 'orders' ? 'Unable to load customer contacts.' : 'Newsletter database is not set up. Run supabase/migrations/009_newsletter_subscribers.sql.')
    const page = await response.json() as T[]
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
}

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 })
  }

  try {
    const [subscribers, orders] = await Promise.all([
      readRows<SubscriberRow>('newsletter_subscribers', 'email', 'email.asc'),
      readRows<OrderContactRow>('orders', 'email,phone', 'id.asc'),
    ])

    const emails = new Map<string, ContactEmail>()
    for (const subscriber of subscribers) {
      const email = subscriber.email?.trim().toLowerCase()
      if (email) emails.set(email, { email, newsletter: true, customer: false })
    }
    for (const order of orders) {
      const email = order.email?.trim().toLowerCase()
      if (!email) continue
      const existing = emails.get(email)
      emails.set(email, { email, newsletter: existing?.newsletter ?? false, customer: true })
    }

    const phones = new Map<string, string>()
    for (const order of orders) {
      const phone = order.phone?.trim()
      const key = phone?.replace(/\D/g, '')
      if (phone && key) phones.set(key, phones.get(key) || phone)
    }

    return NextResponse.json({
      emails: Array.from(emails.values()).sort((a, b) => a.email.localeCompare(b.email)),
      phones: Array.from(phones.values()).sort((a, b) => a.localeCompare(b)),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load contacts.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
