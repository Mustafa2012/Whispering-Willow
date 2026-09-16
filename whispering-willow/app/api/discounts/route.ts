import { NextResponse } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function configured() {
  return Boolean(supabaseUrl && serviceRoleKey)
}

function headers() {
  return { apikey: serviceRoleKey!, Authorization: `Bearer ${serviceRoleKey!}` }
}

export async function GET(request: Request) {
  if (!configured()) return NextResponse.json({ error: 'Discount codes are not configured.' }, { status: 503 })
  const code = new URL(request.url).searchParams.get('code')?.trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Enter a discount code.' }, { status: 400 })

  const response = await fetch(`${supabaseUrl}/rest/v1/discount_codes?select=code,discount_type,value,expires_at,usage_limit,usage_count&code=eq.${encodeURIComponent(code)}&is_active=eq.true&limit=1`, { headers: headers(), cache: 'no-store' })
  if (!response.ok) return NextResponse.json({ error: 'Unable to validate discount code.' }, { status: 500 })
  const [discount] = await response.json() as Array<{ code: string; discount_type: 'percentage' | 'fixed'; value: number; expires_at?: string; usage_limit?: number; usage_count: number }>
  if (!discount) return NextResponse.json({ error: 'That discount code is not valid.' }, { status: 404 })
  if (discount.expires_at && new Date(discount.expires_at) <= new Date()) return NextResponse.json({ error: 'That discount code has expired.' }, { status: 400 })
  if (discount.usage_limit !== null && discount.usage_limit !== undefined && discount.usage_count >= discount.usage_limit) return NextResponse.json({ error: 'That discount code has reached its usage limit.' }, { status: 400 })
  return NextResponse.json({ code: discount.code, discountType: discount.discount_type, value: Number(discount.value) })
}