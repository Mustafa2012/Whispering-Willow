import { NextResponse } from 'next/server'
import {
  createStoreReview,
  deleteStoreReview,
  getAdminReviews,
  isReviewDatabaseConfigured,
  setStoreReviewPublished,
} from '@/lib/reviews-server'

function authorized(request: Request) {
  return Boolean(process.env.ADMIN_PANEL_PASSWORD)
    && request.headers.get('x-admin-password') === process.env.ADMIN_PANEL_PASSWORD
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  if (!isReviewDatabaseConfigured()) return NextResponse.json({ error: 'Review database is not configured.' }, { status: 503 })

  try {
    return NextResponse.json(await getAdminReviews())
  } catch {
    return NextResponse.json({ error: 'Unable to load store reviews.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  if (!isReviewDatabaseConfigured()) return NextResponse.json({ error: 'Review database is not configured.' }, { status: 503 })

  try {
    const body = await request.json() as { reviewerName?: unknown; rating?: unknown; reviewText?: unknown; imagePaths?: unknown }
    const reviewerName = typeof body.reviewerName === 'string' ? body.reviewerName.trim() : ''
    const reviewText = typeof body.reviewText === 'string' ? body.reviewText.trim() : ''
    const rating = Number(body.rating)
    const imagePaths = Array.isArray(body.imagePaths) ? body.imagePaths : []

    if (!reviewerName || reviewerName.length > 80 || !reviewText || reviewText.length > 1200 || !Number.isInteger(rating) || rating < 1 || rating > 5 || imagePaths.length > 3 || imagePaths.some((path) => typeof path !== 'string' || !path.startsWith('admin/'))) {
      return NextResponse.json({ error: 'Enter a name, a 1–5 star rating, and review text (up to 1,200 characters).' }, { status: 400 })
    }

    const review = await createStoreReview({ reviewer_name: reviewerName, rating, review_text: reviewText }, imagePaths as string[])
    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to create store review.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  if (!isReviewDatabaseConfigured()) return NextResponse.json({ error: 'Review database is not configured.' }, { status: 503 })

  try {
    const body = await request.json() as { id?: unknown; isPublished?: unknown }
    if (!Number.isInteger(body.id) || typeof body.isPublished !== 'boolean') {
      return NextResponse.json({ error: 'Invalid review update.' }, { status: 400 })
    }

    await setStoreReviewPublished(body.id as number, body.isPublished)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to update store review.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  if (!isReviewDatabaseConfigured()) return NextResponse.json({ error: 'Review database is not configured.' }, { status: 503 })

  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Invalid review.' }, { status: 400 })

  try {
    await deleteStoreReview(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to delete store review.' }, { status: 500 })
  }
}
