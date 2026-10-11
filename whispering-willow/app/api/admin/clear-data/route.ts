import { NextResponse } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const clearPassword = process.env.CLEAR_DATA_PASSWORD

type ReviewRow = { image_paths?: string[] }
type OrderRow = { proof_url?: string | null }

function headers() {
  return {
    apikey: serviceRoleKey!,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }
}

function orderProofPath(url?: string | null) {
  if (!url || !supabaseUrl) return null
  try {
    const pathname = new URL(url).pathname
    const marker = '/storage/v1/object/public/order-proofs/'
    if (!pathname.startsWith(`${supabaseUrl ? new URL(supabaseUrl).pathname : ''}${marker}`)) {
      return pathname.startsWith(marker) ? decodeURIComponent(pathname.slice(marker.length)) : null
    }
    return decodeURIComponent(pathname.slice(pathname.indexOf(marker) + marker.length))
  } catch {
    return null
  }
}

async function removeStorageObjects(bucket: string, paths: string[]) {
  if (!paths.length) return true
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({ prefixes: paths }),
  })
  return response.ok
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_PANEL_PASSWORD || request.headers.get('x-admin-password') !== process.env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  if (!clearPassword) {
    return NextResponse.json({ error: 'Clear-all password is not configured.' }, { status: 503 })
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 })
  }

  let confirmationPassword = ''
  try {
    const body = await request.json() as { confirmationPassword?: unknown }
    confirmationPassword = typeof body.confirmationPassword === 'string' ? body.confirmationPassword : ''
  } catch {
    return NextResponse.json({ error: 'Enter the clear-all password.' }, { status: 400 })
  }
  if (confirmationPassword !== clearPassword) {
    return NextResponse.json({ error: 'The clear-all password is incorrect.' }, { status: 403 })
  }

  try {
    const [reviewsResponse, ordersResponse] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/store_reviews?select=image_paths`, { headers: headers(), cache: 'no-store' }),
      fetch(`${supabaseUrl}/rest/v1/orders?select=proof_url`, { headers: headers(), cache: 'no-store' }),
    ])

    if (!ordersResponse.ok) return NextResponse.json({ error: 'Unable to read orders; nothing was cleared.' }, { status: 500 })
    if (!reviewsResponse.ok && reviewsResponse.status !== 404) {
      return NextResponse.json({ error: 'Unable to read reviews; nothing was cleared.' }, { status: 500 })
    }

    const reviews = reviewsResponse.ok ? await reviewsResponse.json() as ReviewRow[] : []
    const orders = await ordersResponse.json() as OrderRow[]

    if (reviews.length) {
      const deleteReviewsResponse = await fetch(`${supabaseUrl}/rest/v1/store_reviews?id=not.is.null`, {
        method: 'DELETE',
        headers: { ...headers(), Prefer: 'return=minimal' },
      })
      if (!deleteReviewsResponse.ok) {
        return NextResponse.json({ error: 'Unable to clear reviews; orders were not changed.' }, { status: 500 })
      }
    }

    if (orders.length) {
      const deleteOrdersResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=not.is.null`, {
        method: 'DELETE',
        headers: { ...headers(), Prefer: 'return=minimal' },
      })
      if (!deleteOrdersResponse.ok) {
        return NextResponse.json({ error: 'Reviews were cleared, but orders could not be cleared.' }, { status: 500 })
      }
    }

    const reviewImagePaths = reviews.flatMap((review) => review.image_paths || [])
    const orderProofPaths = orders.map((order) => orderProofPath(order.proof_url)).filter((path): path is string => Boolean(path))
    const [reviewImagesRemoved, orderProofsRemoved] = await Promise.all([
      removeStorageObjects('review-images', reviewImagePaths),
      removeStorageObjects('order-proofs', orderProofPaths),
    ])

    return NextResponse.json({
      success: true,
      warning: reviewImagesRemoved && orderProofsRemoved ? undefined : 'Records were cleared, but some attached files could not be removed.',
    })
  } catch {
    return NextResponse.json({ error: 'Unable to clear reviews and orders.' }, { status: 500 })
  }
}