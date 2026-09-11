'use client'

import { useState } from 'react'

const adminSessionKey = 'whispering-willow-admin-authenticated'
const adminPasswordSessionKey = 'whispering-willow-admin-password'

export function AdminAccess() {
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSigningIn(true)
    setMessage('')

    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const result = (await response.json()) as { error?: string }
      setMessage(result.error || 'Incorrect username or password.')
      setIsSigningIn(false)
      return
    }

    sessionStorage.setItem(adminSessionKey, 'true')
    sessionStorage.setItem(adminPasswordSessionKey, password)
    window.location.assign('/admin')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setMessage('')
          setIsOpen((current) => !current)
        }}
        className="hover:text-foreground"
      >
        Admin
      </button>

      {isOpen ? (
        <div className="absolute bottom-full right-0 mb-4 w-[min(90vw,300px)] rounded-2xl border border-border/70 bg-background p-4 text-left shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-primary">Private access</p>
              <h2 className="mt-1 font-serif text-2xl text-foreground">Admin sign in</h2>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
              Close
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {message ? <p className="text-xs text-destructive">{message}</p> : null}
            <button type="submit" disabled={isSigningIn} className="w-full rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-60">
              {isSigningIn ? 'Checking...' : 'Continue'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}