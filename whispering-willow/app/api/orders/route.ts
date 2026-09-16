import { NextResponse } from 'next/server'
import { getProducts, isProductDatabaseConfigured } from '@/lib/products-server'
import { getCustomerSession } from '@/lib/customer-auth'
import { calculateOrderTotal, DELIVERY_CHARGE, ORDER_DISCOUNT } from '@/lib/order-pricing'

type OrderRequest = {
  customerName?: string
  email?: string
  phone?: string
  address?: string
  paymentMethod?: 'cod' | 'bank_transfer'
  discountCode?: string
  transactionReference?: string
  proofUrl?: string
  notes?: string
  items?: Array<{ name?: string; quantity?: number }>
}

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: Request) {
  if (!isProductDatabaseConfigured() || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Order history is not configured yet.' }, { status: 503 })
  }

  const user = await getCustomerSession(request)
  const email = user?.email?.trim().toLowerCase()
  if (!user || !email) return NextResponse.json({ error: 'Please sign in to view your orders.' }, { status: 401 })

  const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` }
    const ordersResponse = await fetch(`${supabaseUrl}/rest/v1/orders?select=id,order_number,email,total,subtotal,discount,discount_code,delivery_charge,status,payment_method,created_at,address&email=eq.${encodeURIComponent(email)}&order=created_at.desc`, { headers, cache: 'no-store' })
  if (ordersResponse.status === 404) return NextResponse.json({ error: 'Order tables are not set up yet. Run supabase/migrations/001_store.sql in your Supabase SQL editor.' }, { status: 503 })
  if (!ordersResponse.ok) return NextResponse.json({ error: 'Unable to load order history.' }, { status: 500 })

    const orders = await ordersResponse.json() as Array<{ id: number; order_number: string; email: string; total: number; subtotal: number; discount: number; discount_code?: string; delivery_charge: number; status: string; payment_method: string; created_at: string; address: string }>
  if (orders.length === 0) return NextResponse.json([])

  const orderIds = orders.map((order) => order.id).join(',')
  const itemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items?select=order_id,name,price,quantity,total&order_id=in.(${orderIds})`, { headers, cache: 'no-store' })
  if (itemsResponse.status === 404) return NextResponse.json({ error: 'Order tables are not set up yet. Run supabase/migrations/001_store.sql in your Supabase SQL editor.' }, { status: 503 })
  if (!itemsResponse.ok) return NextResponse.json({ error: 'Unable to load order items.' }, { status: 500 })
  const items = await itemsResponse.json() as Array<{ order_id: number; name: string; price: number; quantity: number; total: number }>

  return NextResponse.json(orders.map((order) => ({ ...order, items: items.filter((item) => item.order_id === order.id) })))
}

export async function POST(request: Request) {
  if (!isProductDatabaseConfigured()) {
    return NextResponse.json({ error: 'Orders are not configured yet.' }, { status: 503 })
  }

  try {
    const user = await getCustomerSession(request)
    if (!user?.email) return NextResponse.json({ error: 'Please sign in before placing an order.' }, { status: 401 })
    const body = (await request.json()) as OrderRequest
    const customerName = body.customerName?.trim()
    const email = user.email.trim().toLowerCase()
    const phone = body.phone?.trim()
    const address = body.address?.trim()
    const paymentMethod = body.paymentMethod
    const discountCode = body.discountCode?.trim().toUpperCase()
    const items = body.items || []

    if (!customerName || !email || !phone || !address || !paymentMethod || items.length === 0) {
      return NextResponse.json({ error: 'Customer, delivery, payment, and cart details are required.' }, { status: 400 })
    }
    if (paymentMethod === 'bank_transfer' && (!body.transactionReference?.trim() || !body.proofUrl?.trim())) {
      return NextResponse.json({ error: 'Bank transfer reference and proof are required.' }, { status: 400 })
    }

    const products = await getProducts()
    const orderItems = items.map((item) => {
      const product = products.find((candidate) => candidate.name === item.name && candidate.isActive !== false)
      const quantity = Number(item.quantity)
      if (!product || !Number.isInteger(quantity) || quantity < 1) throw new Error('One or more cart items are no longer available.')
      return { product_id: product.id, name: product.name, price: product.price, quantity, total: product.price * quantity }
    })
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
    let discount = ORDER_DISCOUNT
    let discountUsageCount = 0
    if (discountCode) {
      const discountResponse = await fetch(`${supabaseUrl}/rest/v1/discount_codes?select=code,discount_type,value,expires_at,usage_limit,usage_count&code=eq.${encodeURIComponent(discountCode)}&is_active=eq.true&limit=1`, { headers: { apikey: serviceRoleKey!, Authorization: `Bearer ${serviceRoleKey!}` }, cache: 'no-store' })
      const [discountRow] = await discountResponse.json() as Array<{ code: string; discount_type: 'percentage' | 'fixed'; value: number; expires_at?: string; usage_limit?: number | null; usage_count: number }>
      if (!discountRow || (discountRow.expires_at && new Date(discountRow.expires_at) <= new Date()) || (discountRow.usage_limit !== null && discountRow.usage_limit !== undefined && discountRow.usage_count >= discountRow.usage_limit)) throw new Error('That discount code is invalid or has expired.')
      discountUsageCount = discountRow.usage_count
      discount = discountRow.discount_type === 'percentage' ? subtotal * Number(discountRow.value) / 100 : Number(discountRow.value)
      discount = Math.min(subtotal, Math.max(0, discount))
    }
    const total = calculateOrderTotal(subtotal, discount)
    const headers = { apikey: serviceRoleKey!, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' }
    const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: user.id, customer_name: customerName, email, phone, address, payment_method: paymentMethod, transaction_reference: body.transactionReference?.trim() || null, proof_url: body.proofUrl?.trim() || null, notes: body.notes?.trim() || null, subtotal, discount, discount_code: discountCode || null, delivery_charge: DELIVERY_CHARGE, total, status: 'pending' }),
    })
    if (orderResponse.status === 404) throw new Error('Order tables are not set up yet. Run supabase/migrations/001_store.sql in your Supabase SQL editor.')
    if (!orderResponse.ok) throw new Error('Unable to create order.')
    const [order] = await orderResponse.json() as Array<{ id: number; order_number?: string }>
    const itemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
      method: 'POST', headers,
      body: JSON.stringify(orderItems.map((item) => ({ ...item, order_id: order.id }))),
    })
    if (itemsResponse.status === 404) throw new Error('Order tables are not set up yet. Run supabase/migrations/001_store.sql in your Supabase SQL editor.')
    if (!itemsResponse.ok) throw new Error('Unable to save order items.')
    if (discountCode) {
      await fetch(`${supabaseUrl}/rest/v1/discount_codes?code=eq.${encodeURIComponent(discountCode)}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ usage_count: discountUsageCount + 1 }) })
    }
    return NextResponse.json({ orderNumber: order.order_number || order.id }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create order.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}