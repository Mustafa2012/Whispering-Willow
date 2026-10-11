'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { getCustomerAuthHeaders } from '@/lib/customer-browser'

export function CustomerReviewForm() {
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

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
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
    <section className="mt-12 border-t border-border/70 pt-8">
      <h2 className="font-serif text-2xl text-foreground">Share your experience</h2>
      <p className="mt-2 text-sm text-muted-foreground">Reviews from customers with an order are published after approval.</p>
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
    </section>
  )
}