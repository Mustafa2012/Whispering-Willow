import { NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
import { getPublishedReviews } from '@/lib/reviews-server'
import { hasCustomerPlacedOrder } from '@/lib/customer-orders'

export async function GET() {
  try {
    return NextResponse.json(await getPublishedReviews())
  } catch {
    return NextResponse.json({ error: 'Unable to load store reviews.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getCustomerSession(request)
  if (!user) return NextResponse.json({ error: 'Sign in to submit a review.' }, { status: 401 })

  try {
    if (!(await hasCustomerPlacedOrder(user.email))) {
      return NextResponse.json({ error: 'Place an order before submitting a review.' }, { status: 403 })
    }
    const body = await request.json() as { reviewerName?: unknown; rating?: unknown; reviewText?: unknown; imagePaths?: unknown }
    const reviewerName = typeof body.reviewerName === 'string' ? body.reviewerName.trim() : ''
    const reviewText = typeof body.reviewText === 'string' ? body.reviewText.trim() : ''
    const rating = Number(body.rating)
    const imagePaths = Array.isArray(body.imagePaths) ? body.imagePaths : []
    const validImages = imagePaths.length <= 3 && imagePaths.every((path) => typeof path === 'string' && path.startsWith(`${user.id}/`))

    if (!reviewerName || reviewerName.length > 80 || !reviewText || reviewText.length > 1200 || !Number.isInteger(rating) || rating < 1 || rating > 5 || !validImages) {
      return NextResponse.json({ error: 'Enter a name, a 1–5 star rating, review text, and up to three of your uploaded images.' }, { status: 400 })
    }

    const { createStoreReview } = await import('@/lib/reviews-server')
    const review = await createStoreReview({ reviewer_name: reviewerName, rating, review_text: reviewText }, imagePaths as string[], user.id)
    return NextResponse.json({ id: review.id, is_published: review.is_published }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to submit your review.' }, { status: 500 })
  }
}
