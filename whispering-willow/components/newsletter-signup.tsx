'use client'

import { useState } from 'react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
    <section aria-labelledby="newsletter-heading" className="bg-secondary/50">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">A little note from Willow</p>
          <h2 id="newsletter-heading" className="mt-3 font-serif text-3xl text-foreground md:text-4xl">Join our newsletter</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Be the first to hear about new pieces, thoughtful styling ideas, and special offers.</p>
          <form onSubmit={subscribe} className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
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
    </section>
  )
}
