import { unstable_noStore as noStore } from 'next/cache'
import type { StoreReview } from '@/lib/reviews'

const supabaseUrl = process.env.SUPABASE_URL
  ?.replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function isReviewDatabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey)
}

function headers() {
  return {
    apikey: serviceRoleKey!,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }
}

async function fetchReviews(query: string, missingTableIsEmpty = false): Promise<StoreReview[]> {
  noStore()
  if (!isReviewDatabaseConfigured()) return []

  const response = await fetch(`${supabaseUrl}/rest/v1/store_reviews?${query}`, {
    headers: headers(),
    cache: 'no-store',
  })

  if ((response.status === 404 || response.status === 400) && missingTableIsEmpty) {
    const errorText = await response.text()
    if (errorText.toLowerCase().includes('does not exist') || errorText.toLowerCase().includes('not found') || errorText.toLowerCase().includes('relation')) {
      return []
    }
  }
  if (!response.ok) throw new Error('Unable to load store reviews.')
  return await response.json() as StoreReview[]
}

async function getSignedImageUrl(path: string) {
  const response = await fetch(`${supabaseUrl}/storage/v1/object/sign/review-images/${path.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ expiresIn: 3600 }),
    cache: 'no-store',
  })
  if (!response.ok) return null
  const result = await response.json() as { signedURL?: string }
  if (!result.signedURL) return null
  return result.signedURL.startsWith('http')
    ? result.signedURL
    : `${supabaseUrl}/storage/v1${result.signedURL.startsWith('/') ? result.signedURL : `/${result.signedURL}`}`
}

async function signReviews(reviews: StoreReview[], key: 'images' | 'image_urls') {
  return Promise.all(reviews.map(async (review) => ({
    ...review,
    [key]: (await Promise.all((review.image_paths || []).map(getSignedImageUrl))).filter((url): url is string => Boolean(url)),
  })))
}

export function getPublishedReviews() {
  return fetchReviews('select=id,reviewer_name,rating,review_text,created_at,image_paths&is_published=eq.true&order=created_at.desc', true)
    .then((reviews) => signReviews(reviews, 'images'))
    .then((reviews) => reviews.map(({ image_paths: _imagePaths, image_urls: _imageUrls, ...review }) => review))
}

export function getAdminReviews() {
  return fetchReviews('select=*&order=created_at.desc').then((reviews) => signReviews(reviews, 'image_urls'))
}

export async function createStoreReview(review: Pick<StoreReview, 'reviewer_name' | 'rating' | 'review_text'>, imagePaths: string[] = [], customerId?: string) {
  if (!isReviewDatabaseConfigured()) throw new Error('Review database is not configured.')

  const response = await fetch(`${supabaseUrl}/rest/v1/store_reviews`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify({ ...review, image_paths: imagePaths, customer_id: customerId || null, is_published: false }),
  })

  if (!response.ok) throw new Error('Unable to create store review.')
  return (await response.json() as StoreReview[])[0]
}

export async function setStoreReviewPublished(id: number, isPublished: boolean) {
  if (!isReviewDatabaseConfigured()) throw new Error('Review database is not configured.')

  const response = await fetch(`${supabaseUrl}/rest/v1/store_reviews?id=eq.${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ is_published: isPublished }),
  })

  if (!response.ok) throw new Error('Unable to update store review.')
}

export async function deleteStoreReview(id: number) {
  if (!isReviewDatabaseConfigured()) throw new Error('Review database is not configured.')

  const response = await fetch(`${supabaseUrl}/rest/v1/store_reviews?id=eq.${id}&select=image_paths`, {
    method: 'DELETE',
    headers: { ...headers(), Prefer: 'return=representation' },
  })

  if (!response.ok) throw new Error('Unable to delete store review.')
  const [review] = await response.json() as Array<{ image_paths?: string[] }>
  if (review?.image_paths?.length) {
    await fetch(`${supabaseUrl}/storage/v1/object/review-images`, {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({ prefixes: review.image_paths }),
    })
  }
}
