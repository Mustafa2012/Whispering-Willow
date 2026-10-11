'use client'

import { useEffect, useMemo, useState } from 'react'

type AdminOrder = {
  id: number
  order_number?: string
  customer_name: string
  email: string
  phone: string
  address: string
  payment_method: string
  transaction_reference?: string
  proof_url?: string
  notes?: string
  admin_notes?: string
  order_items?: Array<{ id: number; name: string; price: number; quantity: number; total: number; selected_size?: string | null }>
  total: number
  status: string
  created_at?: string
}

const adminSessionKey = 'whispering-willow-admin-authenticated'
const adminPasswordSessionKey = 'whispering-willow-admin-password'
const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'] as const
type Filter = 'all' | typeof statuses[number] | 'approved' | 'declined'

const filterLabels: Record<Filter, string> = {
  all: 'All orders',
  pending: 'Pending',
  approved: 'Approved',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  declined: 'Declined',
  cancelled: 'Cancelled',
}

const filterMatches = (order: AdminOrder, filter: Filter) => {
  if (filter === 'all') return true
  if (filter === 'approved') return order.status === 'confirmed'
  if (filter === 'declined') return order.status === 'cancelled'
  return order.status === filter
}

export function AdminOrdersPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isClearFormOpen, setIsClearFormOpen] = useState(false)
  const [clearPassword, setClearPassword] = useState('')
  const [clearMessage, setClearMessage] = useState('')
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    const sessionPassword = sessionStorage.getItem(adminPasswordSessionKey)
    if (sessionStorage.getItem(adminSessionKey) !== 'true' || !sessionPassword) {
      window.location.replace('/')
      return
    }
    setPassword(sessionPassword)
    setIsAuthorized(true)
  }, [])

  useEffect(() => {
    if (!isAuthorized) return
    fetch('/api/admin/orders', { headers: { 'x-admin-password': password } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load orders.')
        setOrders(await response.json() as AdminOrder[])
      })
      .catch(() => setMessage('Unable to load orders. Check your database configuration.'))
      .finally(() => setIsLoading(false))
  }, [isAuthorized, password])

  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    approved: orders.filter((order) => order.status === 'confirmed').length,
    processing: orders.filter((order) => order.status === 'processing').length,
    shipped: orders.filter((order) => order.status === 'shipped').length,
    completed: orders.filter((order) => order.status === 'completed').length,
    declined: orders.filter((order) => order.status === 'cancelled').length,
    cancelled: orders.filter((order) => order.status === 'cancelled').length,
  }), [orders])

  const visibleOrders = orders.filter((order) => filterMatches(order, filter))

  const updateOrder = async (order: AdminOrder, status: string) => {
    const response = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: order.id, status }),
    })
    if (!response.ok) {
      setMessage('Unable to update order.')
      return
    }
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item))
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
      setOrders([])
      setClearMessage(result.warning || 'All reviews and orders have been cleared.')
      setClearPassword('')
      setIsClearFormOpen(false)
    } catch (error) {
      setClearMessage(error instanceof Error ? error.message : 'Unable to clear reviews and orders.')
    } finally {
      setIsClearing(false)
    }
  }

  if (!isAuthorized) return null

  return (
    <main className="min-h-screen bg-secondary/30 px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-border/70 pb-8 md:flex-row md:items-end">
          <div>
            <a href="/" className="text-xs uppercase tracking-[0.24em] text-primary hover:text-foreground">Back to storefront</a>
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-primary">Admin</p>
            <h1 className="mt-2 font-serif text-5xl text-foreground md:text-6xl">Orders dashboard</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">Track every order, payment detail, and fulfillment decision in one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/admin" className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground transition-colors hover:border-primary">Inventory</a>
            <a href="/admin/reviews" className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground transition-colors hover:border-primary">Store reviews</a>
          </div>
        </div>

        {message ? <p className="mb-6 text-sm text-primary">{message}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(['all', 'pending', 'approved', 'declined'] as const).map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-2xl border p-5 text-left transition-colors ${filter === item ? 'border-primary bg-background' : 'border-border/70 bg-background/70 hover:border-primary/60'}`}>
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{filterLabels[item]}</span>
              <strong className="mt-2 block font-serif text-4xl text-foreground">{counts[item]}</strong>
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-b border-border/70 pb-5">
          {(['all', 'pending', 'approved', 'processing', 'shipped', 'completed', 'declined'] as Filter[]).map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm transition-colors ${filter === item ? 'bg-foreground text-background' : 'border border-border bg-background text-foreground hover:border-primary'}`}>{filterLabels[item]} ({counts[item]})</button>
          ))}
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-baseline justify-between"><h2 className="font-serif text-3xl text-foreground">{filterLabels[filter]}</h2><span className="text-sm text-muted-foreground">{visibleOrders.length} shown</span></div>
          {isLoading ? <p className="text-muted-foreground">Loading orders...</p> : null}
          {!isLoading && visibleOrders.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-muted-foreground">No orders match this filter.</div> : null}
          <div className="space-y-4">
            {visibleOrders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-border/70 bg-background p-5">
                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3"><p className="text-xs uppercase tracking-[0.16em] text-primary">Order #{order.order_number || order.id}</p><span className="rounded-full bg-secondary/50 px-3 py-1 text-xs uppercase tracking-wide text-foreground">{order.status === 'confirmed' ? 'approved' : order.status === 'cancelled' ? 'declined' : order.status}</span></div>
                    <h3 className="mt-2 font-serif text-2xl text-foreground">{order.customer_name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{order.email} · {order.phone}</p>
                    <p className="mt-3 text-sm text-foreground">{order.address}</p>
                    {order.created_at ? <p className="mt-2 text-xs text-muted-foreground">Placed {new Date(order.created_at).toLocaleString()}</p> : null}
                    {order.order_items?.length ? <div className="mt-4 space-y-1 border-t border-border/60 pt-3">{order.order_items.map((item) => <p key={item.id} className="text-sm text-muted-foreground">{item.quantity} × {item.name}{item.selected_size ? ` (Size ${item.selected_size})` : ''} <span className="text-foreground">(PKR {Number(item.total).toLocaleString('en-PK')})</span></p>)}</div> : null}
                    {order.notes ? <p className="mt-3 text-sm text-muted-foreground">Customer note: {order.notes}</p> : null}
                  </div>
                  <div className="flex min-w-56 flex-col items-start gap-3 lg:items-end">
                    <div className="text-left lg:text-right"><p className="font-serif text-2xl text-foreground">PKR {Number(order.total).toLocaleString('en-PK')}</p><p className="text-xs uppercase tracking-wide text-muted-foreground">{order.payment_method.replace('_', ' ')}</p></div>
                    {order.transaction_reference ? <p className="text-sm text-muted-foreground">Reference: {order.transaction_reference}</p> : null}
                    {order.proof_url ? <a href={order.proof_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:text-foreground">View transfer proof</a> : null}
                    <select value={order.status} onChange={(event) => void updateOrder(order, event.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm lg:w-auto"><option value="pending">Pending</option><option value="confirmed">Approved</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="completed">Completed</option><option value="cancelled">Declined</option></select>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-destructive/40 pt-8" aria-labelledby="clear-data-heading">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 id="clear-data-heading" className="font-serif text-2xl text-foreground">Clear reviews and orders</h2>
              <p className="mt-1 text-sm text-muted-foreground">Permanently deletes all reviews, orders, order items, and attached files.</p>
            </div>
            {!isClearFormOpen ? (
              <button type="button" onClick={() => { setClearMessage(''); setIsClearFormOpen(true) }} className="border border-destructive px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10">Clear all data</button>
            ) : null}
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
    </main>
  )
}