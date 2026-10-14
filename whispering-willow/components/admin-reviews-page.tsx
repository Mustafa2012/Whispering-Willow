'use client'

import { ImagePlus, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { StoreReview } from '@/lib/reviews'
import { adminPasswordSessionKey, hasAdminAccess } from '@/lib/admin-browser'

const maxReviewImages = 3
const maxImageBytes = 5 * 1024 * 1024

export function AdminReviewsPage() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [reviews, setReviews] = useState<StoreReview[]>([])
  const [reviewerName, setReviewerName] = useState('')
  const [rating, setRating] = useState('5')
  const [reviewText, setReviewText] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const sessionPassword = sessionStorage.getItem(adminPasswordSessionKey)
    void hasAdminAccess().then((authorized) => {
      if (!authorized) {
        window.location.replace('/')
        return
      }
      setPassword(sessionPassword || '')
      setAuthorized(true)
    }).catch(() => window.location.replace('/'))
  }, [])

  useEffect(() => {
    if (!authorized) return
    fetch('/api/admin/reviews', { headers: { 'x-admin-password': password } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load reviews. Check that the store reviews migrations are applied.')
        setReviews(await response.json() as StoreReview[])
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Unable to load reviews.'))
      .finally(() => setIsLoading(false))
  }, [authorized, password])

  const chooseImages = (files: FileList | null) => {
    const selected = Array.from(files || [])
    if (selected.length > maxReviewImages) {
      setMessage('Choose up to three images.')
      return
    }
    if (selected.some((file) => !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type))) {
      setMessage('Use JPEG, PNG, WebP, or GIF images.')
      return
    }
    if (selected.some((file) => file.size > maxImageBytes)) {
      setMessage('Each image must be 5 MB or smaller.')
      return
    }
    setImageFiles(selected)
    setMessage('')
  }

  const uploadImages = async () => {
    if (!imageFiles.length) return []
    const body = new FormData()
    imageFiles.forEach((file) => body.append('files', file))
    const response = await fetch('/api/reviews/images', { method: 'POST', headers: { 'x-admin-password': password }, body })
    const result = await response.json() as { imagePaths?: string[]; error?: string }
    if (!response.ok || !result.imagePaths) throw new Error(result.error || 'Unable to upload review images.')
    return result.imagePaths
  }

  const createReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')
    try {
      const imagePaths = await uploadImages()
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ reviewerName, rating: Number(rating), reviewText, imagePaths }),
      })
      const result = await response.json() as StoreReview | { error?: string }
      if (!response.ok) throw new Error((result as { error?: string }).error || 'Unable to create review.')
      const refreshed = await fetch('/api/admin/reviews', { headers: { 'x-admin-password': password } })
      setReviews(await refreshed.json() as StoreReview[])
      setReviewerName('')
      setRating('5')
      setReviewText('')
      setImageFiles([])
      setMessage('Review saved as a draft.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create review.')
    } finally {
      setIsSaving(false)
    }
  }

  const togglePublished = async (review: StoreReview) => {
    const isPublished = !review.is_published
    const response = await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: review.id, isPublished }),
    })
    if (!response.ok) {
      setMessage('Unable to update review.')
      return
    }
    setReviews((current) => current.map((item) => item.id === review.id ? { ...item, is_published: isPublished } : item))
    setMessage(isPublished ? 'Review published.' : 'Review unpublished.')
  }

  const deleteReview = async (review: StoreReview) => {
    if (!window.confirm(`Delete the review from ${review.reviewer_name}?`)) return
    const response = await fetch(`/api/admin/reviews?id=${review.id}`, { method: 'DELETE', headers: { 'x-admin-password': password } })
    if (!response.ok) {
      setMessage('Unable to delete review.')
      return
    }
    setReviews((current) => current.filter((item) => item.id !== review.id))
    setMessage('Review deleted.')
  }

  if (!authorized) return null

  return (
    <main className="min-h-screen bg-secondary/30 px-5 py-10 sm:px-6 md:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end">
          <div>
            <a href="/" className="text-xs uppercase tracking-[0.2em] text-primary hover:text-foreground">Back to storefront</a>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-primary">Admin</p>
            <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">Store reviews</h1>
          </div>
          <nav aria-label="Admin sections" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="/admin" className="text-muted-foreground hover:text-foreground">Inventory</a>
            <a href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</a>
            <a href="/admin/reviews" aria-current="page" className="text-foreground">Reviews</a>
            <a href="/admin/settings" className="text-muted-foreground hover:text-foreground">Settings</a>
          </nav>
        </header>

        {message ? <p role="status" className="mb-5 text-sm text-primary">{message}</p> : null}

        <section className="border-b border-border/70 pb-8">
          <h2 className="mb-4 font-serif text-2xl text-foreground">Add a store review</h2>
          <form onSubmit={createReview} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
            <input required maxLength={80} value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} placeholder="Reviewer name" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none" />
            <select value={rating} onChange={(event) => setRating(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none">
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}
            </select>
            <textarea required maxLength={1200} rows={4} value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="Customer review" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none sm:col-span-2" />
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <label className="inline-flex cursor-pointer items-center gap-2 border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary">
                <ImagePlus className="h-4 w-4" /> Add photos
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => chooseImages(event.target.files)} className="sr-only" />
              </label>
              <span className="text-xs text-muted-foreground">Up to 3 images, 5 MB each</span>
              {imageFiles.map((file) => <span key={`${file.name}-${file.size}`} className="text-xs text-muted-foreground">{file.name}</span>)}
              {imageFiles.length ? <button type="button" onClick={() => setImageFiles([])} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" />Clear photos</button> : null}
            </div>
            <button type="submit" disabled={isSaving} className="bg-foreground px-5 py-3 text-sm text-background transition-opacity hover:opacity-85 disabled:opacity-60 sm:col-span-2 sm:justify-self-end">{isSaving ? 'Saving...' : 'Add review as draft'}</button>
          </form>
        </section>

        <section className="pt-8">
          <div className="mb-4 flex items-baseline justify-between"><h2 className="font-serif text-2xl text-foreground">All reviews</h2><span className="text-sm text-muted-foreground">{reviews.length}</span></div>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading reviews...</p> : null}
          {!isLoading && reviews.length === 0 ? <p className="border-y border-border/70 py-5 text-sm text-muted-foreground">No reviews added yet.</p> : null}
          <div className="divide-y divide-border/70 border-y border-border/70">
            {reviews.map((review) => (
              <article key={review.id} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-medium text-foreground">{review.reviewer_name}</h3>
                    <span className="flex text-primary" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className={`h-3.5 w-3.5 ${index < review.rating ? 'fill-current' : ''}`} />)}</span>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{review.is_published ? 'Published' : review.customer_id ? 'Pending customer review' : 'Draft'}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{review.review_text}</p>
                  {review.image_urls?.length ? <div className="mt-3 flex flex-wrap gap-2">{review.image_urls.map((url) => <img key={url} src={url} alt="Review attachment" className="h-16 w-16 border border-border object-cover" />)}</div> : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => void togglePublished(review)} className="border border-border px-3 py-2 text-xs text-foreground hover:border-primary">{review.is_published ? 'Unpublish' : 'Publish'}</button>
                  <button type="button" onClick={() => void deleteReview(review)} className="border border-destructive/50 px-3 py-2 text-xs text-destructive hover:bg-destructive/10">Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}