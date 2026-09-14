'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/products'

type CustomerOrder = {
  order_number: string
  total: number
  status: string
  payment_method: string
  created_at: string
  address: string
  items: Array<{ name: string; quantity: number; total: number }>
}

const statusLabels: Record<string, string> = {
  pending: 'Pending confirmation',
  confirmed: 'Confirmed',
  processing: 'Being prepared',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function OrdersPage() {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function findOrders(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')
    const response = await fetch(`/api/orders?email=${encodeURIComponent(email.trim())}`)
    const result = await response.json() as CustomerOrder[] | { error?: string }
    if (!response.ok) {
      setOrders([])
      setMessage((result as { error?: string }).error || 'Unable to load your orders.')
    } else if ((result as CustomerOrder[]).length === 0) {
      setOrders([])
      setMessage('No orders were found for this email address.')
    } else {
      setOrders(result as CustomerOrder[])
    }
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-secondary/30 px-6 py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm text-primary">Back to shop</a>
        <div className="mt-5 max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Order tracking</p>
          <h1 className="mt-2 font-serif text-5xl text-foreground">Your orders</h1>
          <p className="mt-4 text-muted-foreground">Enter the email address you used at checkout to view your order history and statuses.</p>
        </div>

        <form onSubmit={findOrders} className="mt-8 flex flex-col gap-3 rounded-2xl border border-border/70 bg-background p-4 sm:flex-row">
          <label className="flex-1"><span className="sr-only">Checkout email</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your checkout email" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" /></label>
          <button type="submit" disabled={isLoading} className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-60">{isLoading ? 'Searching...' : 'Find orders'}</button>
        </form>

        {message ? <p className="mt-6 text-sm text-muted-foreground">{message}</p> : null}
        <div className="mt-8 space-y-5">
          {orders.map((order) => (
            <article key={order.order_number} className="rounded-2xl border border-border/70 bg-background p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
                <div><p className="text-xs uppercase tracking-[0.16em] text-primary">{order.order_number}</p><p className="mt-1 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p></div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">{statusLabels[order.status] || order.status}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">{order.items.map((item) => <div key={`${order.order_number}-${item.name}`} className="flex justify-between gap-4"><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.total)}</span></div>)}</div>
              <div className="mt-5 grid gap-3 border-t border-border/60 pt-4 text-sm sm:grid-cols-3"><div><span className="block text-xs uppercase tracking-wide text-muted-foreground">Total</span><strong className="mt-1 block text-foreground">{formatPrice(order.total)}</strong></div><div><span className="block text-xs uppercase tracking-wide text-muted-foreground">Payment</span><strong className="mt-1 block capitalize text-foreground">{order.payment_method.replace('_', ' ')}</strong></div><div><span className="block text-xs uppercase tracking-wide text-muted-foreground">Delivery</span><strong className="mt-1 block text-foreground">{order.address}</strong></div></div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}