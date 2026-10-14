'use client'

import { useEffect, useState } from 'react'
import { customerSupabase } from '@/lib/customer-browser'
import { adminSessionKey } from '@/lib/admin-browser'

export default function AdminAuthCallbackPage() {
  const [message, setMessage] = useState('Verifying your Google account...')

  useEffect(() => {
    let active = true

    async function finishSignIn() {
      if (!customerSupabase) {
        if (active) setMessage('Google sign-in is not configured.')
        return
      }

      const { data, error } = await customerSupabase.auth.getSession()
      if (error || !data.session?.access_token) {
        if (active) setMessage('Unable to verify your Google sign-in. Please try again.')
        return
      }

      const response = await fetch('/api/admin/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: data.session.access_token }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) {
        if (active) setMessage(result.error || 'This Google account is not authorized for admin access.')
        return
      }

      sessionStorage.setItem(adminSessionKey, 'true')
      window.location.replace('/admin')
    }

    void finishSignIn()
    return () => {
      active = false
    }
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/30 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border/70 bg-background p-7 text-center md:p-9">
        <p className="text-sm text-foreground">{message}</p>
        <a href="/" className="mt-6 inline-block text-sm text-primary">Back to shop</a>
      </section>
    </main>
  )
}
