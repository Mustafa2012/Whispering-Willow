'use client'

import { useEffect, useState } from 'react'
import { adminPasswordSessionKey, hasAdminAccess } from '@/lib/admin-browser'

type ContactEmail = { email: string; newsletter: boolean; customer: boolean }
type Contacts = { emails: ContactEmail[]; phones: string[] }

export function AdminContactsPage() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [contacts, setContacts] = useState<Contacts>({ emails: [], phones: [] })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sessionPassword = sessionStorage.getItem(adminPasswordSessionKey)
    void hasAdminAccess().then((hasAccess) => {
      if (!hasAccess) {
        window.location.replace('/')
        return
      }
      setPassword(sessionPassword || '')
      setAuthorized(true)
    }).catch(() => window.location.replace('/'))
  }, [])

  useEffect(() => {
    if (!authorized) return
    fetch('/api/admin/contacts', { headers: { 'x-admin-password': password } })
      .then(async (response) => {
        const result = await response.json() as Contacts | { error?: string }
        if (!response.ok) throw new Error((result as { error?: string }).error || 'Unable to load contacts.')
        setContacts(result as Contacts)
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Unable to load contacts.'))
      .finally(() => setIsLoading(false))
  }, [authorized, password])

  if (!authorized) return null

  return (
    <main className="min-h-screen bg-secondary/30 px-6 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col justify-between gap-6 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
          <div>
            <a href="/" className="text-xs uppercase tracking-[0.24em] text-primary hover:text-foreground">Back to storefront</a>
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-primary">Admin</p>
            <h1 className="mt-2 font-serif text-5xl text-foreground md:text-6xl">Contacts</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">Newsletter subscribers and customers who have placed an order.</p>
          </div>
          <nav aria-label="Admin sections" className="flex flex-wrap gap-3 text-sm">
            <a href="/admin" className="rounded-full border border-border bg-background px-4 py-2.5 hover:border-primary">Inventory</a>
            <a href="/admin/orders" className="rounded-full border border-border bg-background px-4 py-2.5 hover:border-primary">Orders</a>
            <a href="/admin/reviews" className="rounded-full border border-border bg-background px-4 py-2.5 hover:border-primary">Reviews</a>
            <a href="/admin/settings" className="rounded-full border border-border bg-background px-4 py-2.5 hover:border-primary">Settings</a>
          </nav>
        </header>

        {message ? <p role="alert" className="mb-6 text-sm text-destructive">{message}</p> : null}
        {isLoading ? <p className="text-sm text-muted-foreground">Loading contacts...</p> : null}
        {!isLoading && !message ? (
          <div className="space-y-10">
            <section aria-labelledby="contact-emails-heading">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 id="contact-emails-heading" className="font-serif text-3xl text-foreground">Email addresses</h2>
                <span className="text-sm text-muted-foreground">{contacts.emails.length}</span>
              </div>
              {contacts.emails.length ? (
                <ul className="divide-y divide-border/70 border-y border-border/70 bg-background">
                  {contacts.emails.map((contact) => (
                    <li key={contact.email} className="flex flex-col justify-between gap-2 px-4 py-4 sm:flex-row sm:items-center">
                      <a href={`mailto:${contact.email}`} className="break-all text-sm text-foreground hover:text-primary">{contact.email}</a>
                      <span className="text-xs text-muted-foreground">
                        {[contact.newsletter && 'Newsletter', contact.customer && 'Customer'].filter(Boolean).join(' · ')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : <p className="border-y border-border/70 py-5 text-sm text-muted-foreground">No email addresses collected yet.</p>}
            </section>

            <section aria-labelledby="customer-phones-heading">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 id="customer-phones-heading" className="font-serif text-3xl text-foreground">Customer phone numbers</h2>
                <span className="text-sm text-muted-foreground">{contacts.phones.length}</span>
              </div>
              {contacts.phones.length ? (
                <ul className="divide-y divide-border/70 border-y border-border/70 bg-background">
                  {contacts.phones.map((phone) => <li key={phone} className="px-4 py-4"><a href={`tel:${phone}`} className="text-sm text-foreground hover:text-primary">{phone}</a></li>)}
                </ul>
              ) : <p className="border-y border-border/70 py-5 text-sm text-muted-foreground">No customer phone numbers collected yet.</p>}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  )
}
