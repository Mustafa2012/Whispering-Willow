'use client'

import { useEffect, useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get('error')
    if (error) setMessage(error)
  }, [])

  async function requestMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')
    const response = await fetch('/api/auth/request-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    const result = await response.json() as { error?: string }
    if (!response.ok) setMessage(result.error || 'Unable to send the magic link.')
    else setMessage('Check your email for a sign-in link.')
    setIsLoading(false)
  }

  return <main className="flex min-h-screen items-center justify-center bg-secondary/30 px-6 py-12"><section className="w-full max-w-md rounded-2xl border border-border/70 bg-background p-7 md:p-9"><a href="/" className="text-sm text-primary">Back to shop</a><p className="mt-8 text-xs uppercase tracking-[0.2em] text-primary">Customer account</p><h1 className="mt-2 font-serif text-4xl text-foreground">Sign in</h1><p className="mt-3 text-sm text-muted-foreground">We will send a secure sign-in link to your email. No password needed.</p><form onSubmit={requestMagicLink} className="mt-7 space-y-4"><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" /><button disabled={isLoading} className="w-full rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground disabled:opacity-60">{isLoading ? 'Sending link...' : 'Send magic link'}</button></form>{message ? <p className="mt-4 text-sm text-primary">{message}</p> : null}</section></main>
}