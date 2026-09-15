'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export default function LoginPage() {
  const [message, setMessage] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get('error')
    if (error) setMessage(error)
  }, [])

  async function handleGoogleLogin() {
    if (!supabase) {
      setMessage('Google sign-in is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
      return
    }

    setIsGoogleLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/orders`,
      },
    })

    if (error) {
      setMessage(error.message || 'Unable to continue with Google.')
      setIsGoogleLoading(false)
      return
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-secondary/30 px-6 py-12"><section className="w-full max-w-md rounded-2xl border border-border/70 bg-background p-7 md:p-9"><a href="/" className="text-sm text-primary">Back to shop</a><p className="mt-8 text-xs uppercase tracking-[0.2em] text-primary">Customer account</p><h1 className="mt-2 font-serif text-4xl text-foreground">Sign in</h1><div className="mt-8"><button type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading} className="flex w-full items-center justify-center gap-3 rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground disabled:opacity-60"><svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5"><path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.62l6.85-6.85C35.99 2.46 30.57 0 24 0 14.64 0 6.57 5.38 2.56 13.22l7.98 6.19C12.98 13.89 17.96 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.5 24.55c0-1.63-.14-3.2-.4-4.7H24v8.9h12.8c-.56 2.94-2.2 5.44-4.7 7.12l7.64 5.93c4.46-4.12 7.76-10.2 7.76-17.25Z"/><path fill="#FBBC05" d="M32.1 35.86c-2.1 1.42-4.8 2.25-8.1 2.25-6.04 0-11.02-4.39-12.82-10.28l-8 6.2C6.58 42.62 14.66 48 24 48c6.13 0 11.29-2.03 15.1-5.14l-7-7Z"/><path fill="#34A853" d="M11.18 27.83A12.02 12.02 0 0 1 10.5 24c0-1.35.23-2.67.64-3.92L2.56 13.9A23.97 23.97 0 0 0 0 24c0 3.83.9 7.46 2.56 10.67l8.62-6.84Z"/></svg><span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span></button></div>{message ? <p className="mt-4 text-sm text-primary">{message}</p> : null}</section></main>
}