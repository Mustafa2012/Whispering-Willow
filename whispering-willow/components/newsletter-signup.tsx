'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export function NewsletterSignup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsOpen(true), 15000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  const subscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setIsSuccess(false)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Unable to subscribe right now.')
      setEmail('')
      setMessage("You're on the list. Thank you for subscribing!")
      setIsSuccess(true)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to subscribe right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    isOpen ? (
      <div
        className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false)
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-heading"
          className="relative w-full max-w-lg border border-border bg-background px-6 py-8 text-center shadow-2xl sm:px-10 sm:py-10"
        >
          <button
            type="button"
            aria-label="Close newsletter popup"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">A little note from Willow</p>
          <h2 id="newsletter-heading" className="mt-3 font-serif text-3xl text-foreground md:text-4xl">Join our newsletter</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Be the first to hear about new pieces, thoughtful styling ideas, and special offers.</p>
          <form onSubmit={subscribe} className="mt-7 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              className="min-w-0 flex-1 border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button type="submit" disabled={isSubmitting} className="bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? 'Joining...' : 'Sign me up'}
            </button>
          </form>
          {message ? <p role="status" className={`mt-4 text-sm ${isSuccess ? 'text-foreground' : 'text-destructive'}`}>{message}</p> : null}
        </div>
      </div>
    ) : null
  )
}
