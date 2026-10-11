'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'
import { getCustomerAuthHeaders } from '@/lib/customer-browser'
import type { StoreReview } from '@/lib/reviews'

type StoreReviewsProps = {
  reviews: StoreReview[]
}

export function StoreReviews({ reviews }: StoreReviewsProps) {
  const [reviewerName, setReviewerName] = useState('')
  const [rating, setRating] = useState('5')
  const [reviewText, setReviewText] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [message, setMessage] = useState('')
  const [needsSignIn, setNeedsSignIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const chooseImages = (files: FileList | null) => {
    const selected = Array.from(files || [])
    if (selected.length > 3) {
      setMessage('Choose up to three images.')
      return
    }
    if (selected.some((file) => !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type))) {
      setMessage('Use JPEG, PNG, WebP, or GIF images.')
      return
    }
    if (selected.some((file) => file.size > 5 * 1024 * 1024)) {
      setMessage('Each image must be 5 MB or smaller.')
      return
    }
    setImageFiles(selected)
    setMessage('')
  }

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setNeedsSignIn(false)
    try {
      const authHeaders = await getCustomerAuthHeaders()
      if (!authHeaders.Authorization) {
        setNeedsSignIn(true)
        throw new Error('Sign in to submit a review.')
      }

      let imagePaths: string[] = []
      if (imageFiles.length) {
        const uploadBody = new FormData()
        imageFiles.forEach((file) => uploadBody.append('files', file))
        const uploadResponse = await fetch('/api/reviews/images', { method: 'POST', headers: authHeaders, body: uploadBody })
        const uploadResult = await uploadResponse.json() as { imagePaths?: string[]; error?: string }
        if (!uploadResponse.ok || !uploadResult.imagePaths) throw new Error(uploadResult.error || 'Unable to upload review images.')
        imagePaths = uploadResult.imagePaths
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerName, rating: Number(rating), reviewText, imagePaths }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Unable to submit your review.')

      setReviewerName('')
      setRating('5')
      setReviewText('')
      setImageFiles([])
      setMessage('Thank you. Your review has been sent for approval.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to submit your review.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="store-reviews-heading" className="border-y border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">From our customers</p>
            <h2 id="store-reviews-heading" className="mt-2 font-serif text-3xl text-foreground md:text-4xl">Kind words</h2>
          </div>
          {reviews.length ? <span className="text-sm text-muted-foreground">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span> : null}
        </div>
        {reviews.length ? (
          <div className="grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.id} className="border-l border-primary/60 pl-5">
                <div className="flex gap-1 text-primary" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} aria-hidden="true" className={`h-4 w-4 ${index < review.rating ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">&ldquo;{review.review_text}&rdquo;</p>
                {review.images?.length ? <div className="mt-4 flex flex-wrap gap-2">{review.images.map((image) => <img key={image} src={image} alt={`Photo shared by ${review.reviewer_name}`} className="h-20 w-20 border border-border object-cover sm:h-24 sm:w-24" />)}</div> : null}
                <p className="mt-4 text-sm font-medium text-foreground">{review.reviewer_name}</p>
              </article>
            ))}
          </div>
        ) : <p className="border-y border-border/70 py-6 text-sm text-muted-foreground">No customer reviews yet.</p>}

        <div className="mt-12 border-t border-border/70 pt-8">
          <h3 className="font-serif text-2xl text-foreground">Share your experience</h3>
          <form onSubmit={submitReview} className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
            <input required maxLength={80} value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} placeholder="Your display name" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none" />
            <select value={rating} onChange={(event) => setRating(event.target.value)} aria-label="Rating" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none">
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}
            </select>
            <textarea required maxLength={1200} rows={4} value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="Tell us about your experience" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none sm:col-span-2" />
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <label className="cursor-pointer border border-border px-3 py-2 text-sm text-foreground hover:border-primary">
                Add photos
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => chooseImages(event.target.files)} className="sr-only" />
              </label>
              <span className="text-xs text-muted-foreground">Up to 3 images, 5 MB each</span>
              {imageFiles.map((file) => <span key={`${file.name}-${file.size}`} className="text-xs text-muted-foreground">{file.name}</span>)}
              {imageFiles.length ? <button type="button" onClick={() => setImageFiles([])} className="text-xs text-muted-foreground hover:text-foreground">Clear photos</button> : null}
            </div>
            {message ? <p role="status" className="text-sm text-muted-foreground sm:col-span-2">{message} {needsSignIn ? <a href="/login" className="text-primary underline">Sign in</a> : null}</p> : null}
            <button type="submit" disabled={isSubmitting} className="bg-foreground px-5 py-3 text-sm text-background transition-opacity hover:opacity-85 disabled:opacity-60 sm:col-span-2 sm:justify-self-end">{isSubmitting ? 'Submitting...' : 'Submit review'}</button>
          </form>
        </div>
      </div>
    </section>
  )
}