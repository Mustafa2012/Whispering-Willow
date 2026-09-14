import { NextResponse } from 'next/server'
import { getProducts, isProductDatabaseConfigured } from '@/lib/products-server'

type OrderRequest = {
  customerName?: string
  email?: string
  phone?: string
  address?: string
  paymentMethod?: 'cod' | 'bank_transfer'
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

  const email = new URL(request.url).searchParams.get('email')?.trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'An email address is required.' }, { status: 400 })

  const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` }
  const ordersResponse = await fetch(`${supabaseUrl}/rest/v1/orders?select=id,order_number,email,total,status,payment_method,created_at,address&email=eq.${encodeURIComponent(email)}&order=created_at.desc`, { headers, cache: 'no-store' })
  if (!ordersResponse.ok) return NextResponse.json({ error: 'Unable to load order history.' }, { status: 500 })

  const orders = await ordersResponse.json() as Array<{ id: number; order_number: string; email: string; total: number; status: string; payment_method: string; created_at: string; address: string }>
  if (orders.length === 0) return NextResponse.json([])

  const orderIds = orders.map((order) => order.id).join(',')
  const itemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items?select=order_id,name,price,quantity,total&order_id=in.(${orderIds})`, { headers, cache: 'no-store' })
  if (!itemsResponse.ok) return NextResponse.json({ error: 'Unable to load order items.' }, { status: 500 })
  const items = await itemsResponse.json() as Array<{ order_id: number; name: string; price: number; quantity: number; total: number }>

  return NextResponse.json(orders.map((order) => ({ ...order, items: items.filter((item) => item.order_id === order.id) })))
}

export async function POST(request: Request) {
  if (!isProductDatabaseConfigured()) {
    return NextResponse.json({ error: 'Orders are not configured yet.' }, { status: 503 })
  }

  try {
    const body = (await request.json()) as OrderRequest
    const customerName = body.customerName?.trim()
    const email = body.email?.trim()
    const phone = body.phone?.trim()
    const address = body.address?.trim()
    const paymentMethod = body.paymentMethod
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
    const total = orderItems.reduce((sum, item) => sum + item.total, 0)
    const headers = { apikey: serviceRoleKey!, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' }
    const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ customer_name: customerName, email, phone, address, payment_method: paymentMethod, transaction_reference: body.transactionReference?.trim() || null, proof_url: body.proofUrl?.trim() || null, notes: body.notes?.trim() || null, total, status: 'pending' }),
    })
    if (!orderResponse.ok) throw new Error('Unable to create order.')
    const [order] = await orderResponse.json() as Array<{ id: number; order_number?: string }>
    const itemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
      method: 'POST', headers,
      body: JSON.stringify(orderItems.map((item) => ({ ...item, order_id: order.id }))),
    })
    if (!itemsResponse.ok) throw new Error('Unable to save order items.')
    return NextResponse.json({ orderNumber: order.order_number || order.id }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create order.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}