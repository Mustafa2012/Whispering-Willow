'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from '@/lib/shipping-settings'
import { adminPasswordSessionKey, hasAdminAccess } from '@/lib/admin-browser'

type DiscountCode = {
  id: number
  code: string
  discount_type: 'percentage' | 'fixed'
  value: number
  is_active: boolean
  expires_at?: string
  usage_limit?: number | null
  usage_count: number
}

type SettingsForm = {
  deliveryCharge: string
  freeShippingEnabled: boolean
  freeShippingThreshold: string
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  bankTransferEnabled: boolean
}

const defaultSettings: SettingsForm = {
  deliveryCharge: String(DEFAULT_SHIPPING_SETTINGS.deliveryCharge),
  freeShippingEnabled: DEFAULT_SHIPPING_SETTINGS.freeShippingEnabled,
  freeShippingThreshold: String(DEFAULT_SHIPPING_SETTINGS.freeShippingThreshold),
  bankName: DEFAULT_SHIPPING_SETTINGS.bankName,
  bankAccountName: DEFAULT_SHIPPING_SETTINGS.bankAccountName,
  bankAccountNumber: DEFAULT_SHIPPING_SETTINGS.bankAccountNumber,
  bankTransferEnabled: DEFAULT_SHIPPING_SETTINGS.bankTransferEnabled,
}

export function AdminSettingsPage() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [settings, setSettings] = useState<SettingsForm>(defaultSettings)
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [discountForm, setDiscountForm] = useState({
    code: '',
    discountType: 'percentage',
    value: '',
    expiresAt: '',
    usageLimit: '',
  })
  const [adminEmails, setAdminEmails] = useState<string[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [clearPassword, setClearPassword] = useState('')
  const [isClearFormOpen, setIsClearFormOpen] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [message, setMessage] = useState('')
  const [clearMessage, setClearMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sessionPassword = sessionStorage.getItem(adminPasswordSessionKey)
    void hasAdminAccess().then((isAuthorized) => {
      if (!isAuthorized) {
        window.location.replace('/')
        return
      }
      setPassword(sessionPassword || '')
      setAuthorized(true)
    }).catch(() => window.location.replace('/'))
  }, [])

  useEffect(() => {
    if (!authorized) return
    const headers = { 'x-admin-password': password }
    const errors: string[] = []
    const loadResource = async <T,>(
      url: string,
      fallback: string,
      onSuccess: (result: T) => void,
    ) => {
      try {
        const response = await fetch(url, { headers, cache: 'no-store' })
        const result = await response.json() as T | { error?: string }
        if (!response.ok) {
          throw new Error((result as { error?: string }).error || fallback)
        }
        onSuccess(result as T)
      } catch (error) {
        errors.push(error instanceof Error ? error.message : fallback)
      }
    }

    Promise.all([
      loadResource<ShippingSettings>('/api/admin/shipping-settings', 'Unable to load store settings.', (result) => {
        setSettings({
          deliveryCharge: String(result.deliveryCharge),
          freeShippingEnabled: result.freeShippingEnabled,
          freeShippingThreshold: String(result.freeShippingThreshold),
          bankName: result.bankName,
          bankAccountName: result.bankAccountName,
          bankAccountNumber: result.bankAccountNumber,
          bankTransferEnabled: result.bankTransferEnabled,
        })
      }),
      loadResource<DiscountCode[]>('/api/admin/discounts', 'Unable to load discount codes.', setDiscountCodes),
      loadResource<string[]>('/api/admin/emails', 'Unable to load admin emails.', setAdminEmails),
    ]).then(() => {
      if (errors.length) setMessage(errors.join(' '))
    }).finally(() => setIsLoading(false))
  }, [authorized, password])

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingSettings(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/shipping-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({
          ...settings,
          deliveryCharge: Number(settings.deliveryCharge),
          freeShippingThreshold: Number(settings.freeShippingThreshold),
        }),
      })
      const result = await response.json() as ShippingSettings | { error?: string }
      if (!response.ok) throw new Error((result as { error?: string }).error || 'Unable to save settings.')
      const saved = result as ShippingSettings
      setSettings({
        deliveryCharge: String(saved.deliveryCharge),
        freeShippingEnabled: saved.freeShippingEnabled,
        freeShippingThreshold: String(saved.freeShippingThreshold),
        bankName: saved.bankName,
        bankAccountName: saved.bankAccountName,
        bankAccountNumber: saved.bankAccountNumber,
        bankTransferEnabled: saved.bankTransferEnabled,
      })
      setMessage('Payment and shipping settings saved.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save settings.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const createDiscountCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({
        code: discountForm.code,
        discountType: discountForm.discountType,
        value: Number(discountForm.value),
        expiresAt: discountForm.expiresAt || undefined,
        usageLimit: discountForm.usageLimit ? Number(discountForm.usageLimit) : null,
      }),
    })
    const result = await response.json() as DiscountCode | { error?: string }
    if (!response.ok) {
      setMessage((result as { error?: string }).error || 'Unable to create discount code.')
      return
    }
    setDiscountCodes((current) => [result as DiscountCode, ...current])
    setDiscountForm({ code: '', discountType: 'percentage', value: '', expiresAt: '', usageLimit: '' })
    setMessage('Discount code created.')
  }

  const toggleDiscountCode = async (discount: DiscountCode) => {
    const response = await fetch('/api/admin/discounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: discount.id, isActive: !discount.is_active }),
    })
    const result = await response.json() as { error?: string }
    if (!response.ok) {
      setMessage(result.error || 'Unable to update discount code.')
      return
    }
    setDiscountCodes((current) => current.map((item) => item.id === discount.id
      ? { ...item, is_active: !item.is_active }
      : item))
  }

  const deleteDiscountCode = async (discount: DiscountCode) => {
    if (!window.confirm(`Delete ${discount.code}?`)) return
    const response = await fetch(`/api/admin/discounts?id=${discount.id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    const result = await response.json() as { error?: string }
    if (!response.ok) {
      setMessage(result.error || 'Unable to delete discount code.')
      return
    }
    setDiscountCodes((current) => current.filter((item) => item.id !== discount.id))
  }

  const addAdminEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await fetch('/api/admin/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ email: newAdminEmail }),
    })
    const result = await response.json() as { email?: string; error?: string }
    if (!response.ok || typeof result.email !== 'string') {
      setMessage(result.error || 'Unable to add the admin email.')
      return
    }
    const addedEmail = result.email
    setAdminEmails((current) => [...current, addedEmail].sort())
    setNewAdminEmail('')
    setMessage('Admin email added.')
  }

  const removeAdminEmail = async (email: string) => {
    if (!window.confirm(`Remove admin access for ${email}?`)) return
    const response = await fetch(`/api/admin/emails?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    const result = await response.json() as { error?: string }
    if (!response.ok) {
      setMessage(result.error || 'Unable to remove the admin email.')
      return
    }
    setAdminEmails((current) => current.filter((item) => item !== email))
    setMessage('Admin email removed.')
  }

  const clearReviewsAndOrders = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsClearing(true)
    setClearMessage('')
    try {
      const response = await fetch('/api/admin/clear-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ confirmationPassword: clearPassword }),
      })
      const result = await response.json() as { error?: string; warning?: string }
      if (!response.ok) throw new Error(result.error || 'Unable to clear reviews and orders.')
      setClearMessage(result.warning || 'All reviews and orders have been cleared.')
      setClearPassword('')
      setIsClearFormOpen(false)
    } catch (error) {
      setClearMessage(error instanceof Error ? error.message : 'Unable to clear reviews and orders.')
    } finally {
      setIsClearing(false)
    }
  }

  if (!authorized) return null

  return (
    <main className="min-h-screen bg-secondary/30 px-6 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-border/70 pb-8">
          <div>
            <a href="/admin" className="text-xs uppercase tracking-[0.24em] text-primary hover:text-foreground">Back to inventory</a>
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-primary">Admin</p>
            <h1 className="mt-2 font-serif text-5xl text-foreground">Store settings</h1>
            <p className="mt-3 text-muted-foreground">Payment, shipping, discounts, admin access, and data tools.</p>
          </div>
          <nav className="flex flex-wrap gap-3">
            <a href="/admin/orders" className="rounded-full border border-border bg-background px-4 py-2.5 text-sm">Orders</a>
            <a href="/admin/reviews" className="rounded-full border border-border bg-background px-4 py-2.5 text-sm">Reviews</a>
          </nav>
        </header>

        {message ? <p role="status" className="mb-6 text-sm text-primary">{message}</p> : null}
        {isLoading ? <p className="text-sm text-muted-foreground">Loading settings...</p> : null}

        <div className="space-y-10">
          <section className="rounded-2xl border border-border/70 bg-background p-5 md:p-7">
            <h2 className="mb-5 font-serif text-3xl text-foreground">Payment and shipping</h2>
            <form onSubmit={saveSettings} className="space-y-5">
              <label className="flex items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={settings.bankTransferEnabled}
                  onChange={(event) => setSettings((current) => ({ ...current, bankTransferEnabled: event.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                Enable bank transfer at checkout
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-foreground">Bank name
                  <input required maxLength={120} value={settings.bankName} onChange={(event) => setSettings((current) => ({ ...current, bankName: event.target.value }))} className="rounded-xl border border-border bg-card px-3 py-2 outline-none" />
                </label>
                <label className="grid gap-2 text-sm text-foreground">Account holder name
                  <input required maxLength={120} value={settings.bankAccountName} onChange={(event) => setSettings((current) => ({ ...current, bankAccountName: event.target.value }))} className="rounded-xl border border-border bg-card px-3 py-2 outline-none" />
                </label>
                <label className="grid gap-2 text-sm text-foreground sm:col-span-2">Account number
                  <input required maxLength={80} value={settings.bankAccountNumber} onChange={(event) => setSettings((current) => ({ ...current, bankAccountNumber: event.target.value }))} className="rounded-xl border border-border bg-card px-3 py-2 outline-none" />
                </label>
              </div>
              <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-foreground">Delivery charge (PKR)
                  <input required type="number" min="0" step="0.01" value={settings.deliveryCharge} onChange={(event) => setSettings((current) => ({ ...current, deliveryCharge: event.target.value }))} className="rounded-xl border border-border bg-card px-3 py-2 outline-none" />
                </label>
                <label className="grid gap-2 text-sm text-foreground">Free shipping minimum (PKR)
                  <input required type="number" min="0" step="0.01" disabled={!settings.freeShippingEnabled} value={settings.freeShippingThreshold} onChange={(event) => setSettings((current) => ({ ...current, freeShippingThreshold: event.target.value }))} className="rounded-xl border border-border bg-card px-3 py-2 outline-none disabled:opacity-50" />
                </label>
                <label className="flex items-center gap-3 text-sm text-foreground sm:col-span-2">
                  <input type="checkbox" checked={settings.freeShippingEnabled} onChange={(event) => setSettings((current) => ({ ...current, freeShippingEnabled: event.target.checked }))} className="h-4 w-4 accent-primary" />
                  Enable free shipping above the minimum order
                </label>
              </div>
              <button type="submit" disabled={isSavingSettings} className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60">
                {isSavingSettings ? 'Saving...' : 'Save payment and shipping'}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-border/70 bg-background p-5 md:p-7">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-3xl text-foreground">Discount codes</h2>
              <span className="text-sm text-muted-foreground">{discountCodes.length} codes</span>
            </div>
            <form onSubmit={createDiscountCode} className="grid gap-3 md:grid-cols-5">
              <input required value={discountForm.code} onChange={(event) => setDiscountForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="Code e.g. WILLOW10" className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none" />
              <select value={discountForm.discountType} onChange={(event) => setDiscountForm((current) => ({ ...current, discountType: event.target.value }))} className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none"><option value="percentage">Percentage</option><option value="fixed">Fixed PKR</option></select>
              <input required type="number" min={discountForm.discountType === 'percentage' ? 1 : 0.01} step={discountForm.discountType === 'percentage' ? 1 : 0.01} value={discountForm.value} onChange={(event) => setDiscountForm((current) => ({ ...current, value: event.target.value }))} placeholder="Value" className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none" />
              <input type="date" value={discountForm.expiresAt} onChange={(event) => setDiscountForm((current) => ({ ...current, expiresAt: event.target.value }))} className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none" />
              <button type="submit" className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground">Create code</button>
              <input type="number" min="1" value={discountForm.usageLimit} onChange={(event) => setDiscountForm((current) => ({ ...current, usageLimit: event.target.value }))} placeholder="Usage limit (optional)" className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none md:col-span-2" />
            </form>
            <div className="mt-4 space-y-2">
              {discountCodes.map((discount) => (
                <div key={discount.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3">
                  <div><strong className="text-sm text-foreground">{discount.code}</strong><span className="ml-3 text-sm text-muted-foreground">{discount.discount_type === 'percentage' ? `${discount.value}% off` : `${discount.value} PKR off`} · {discount.usage_count}{discount.usage_limit ? `/${discount.usage_limit}` : ''} uses</span></div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void toggleDiscountCode(discount)} className="rounded-full border border-border px-3 py-1 text-xs">{discount.is_active ? 'Active' : 'Inactive'}</button>
                    <button type="button" onClick={() => void deleteDiscountCode(discount)} className="rounded-full border border-destructive/50 px-3 py-1 text-xs text-destructive">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-background p-5 md:p-7">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-3xl text-foreground">Admin email access</h2>
              <span className="text-sm text-muted-foreground">{adminEmails.length} emails</span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">These verified Google emails can sign in to the admin panel.</p>
            <form onSubmit={addAdminEmail} className="flex flex-col gap-3 sm:flex-row">
              <input required type="email" value={newAdminEmail} onChange={(event) => setNewAdminEmail(event.target.value)} placeholder="name@example.com" className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none" />
              <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">Add email</button>
            </form>
            <div className="mt-4 space-y-2">
              {adminEmails.map((email) => (
                <div key={email} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3">
                  <span className="text-sm text-foreground">{email}</span>
                  <button type="button" onClick={() => void removeAdminEmail(email)} className="rounded-full border border-destructive/50 px-3 py-1 text-xs text-destructive">Remove</button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-destructive/40 bg-background p-5 md:p-7" aria-labelledby="clear-data-heading">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 id="clear-data-heading" className="font-serif text-2xl text-foreground">Clear reviews and orders</h2>
                <p className="mt-1 text-sm text-muted-foreground">Permanently deletes all reviews, orders, order items, and attached files.</p>
              </div>
              {!isClearFormOpen ? <button type="button" onClick={() => { setClearMessage(''); setIsClearFormOpen(true) }} className="border border-destructive px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10">Clear all data</button> : null}
            </div>
            {isClearFormOpen ? (
              <form onSubmit={clearReviewsAndOrders} className="mt-5 grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
                <label className="grid gap-2 text-sm text-foreground">Enter the clear-all password
                  <input required type="password" autoComplete="off" value={clearPassword} onChange={(event) => setClearPassword(event.target.value)} className="w-full border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-destructive" />
                </label>
                <button type="submit" disabled={isClearing} className="bg-destructive px-4 py-2.5 text-sm text-white disabled:opacity-60">{isClearing ? 'Clearing...' : 'Permanently clear'}</button>
                <button type="button" onClick={() => { setIsClearFormOpen(false); setClearPassword('') }} disabled={isClearing} className="border border-border px-4 py-2.5 text-sm text-foreground">Cancel</button>
              </form>
            ) : null}
            {clearMessage ? <p role="status" className="mt-4 text-sm text-destructive">{clearMessage}</p> : null}
          </section>
        </div>
      </div>
    </main>
  )
}
