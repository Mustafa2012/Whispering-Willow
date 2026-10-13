'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/products'
import { getCustomerAuthHeaders } from '@/lib/customer-browser'
import { CustomerReviewForm } from '@/components/customer-review-form'
import { downloadOrderReceipt } from '@/lib/order-receipt'

type CustomerOrder = {
  order_number: string
  subtotal?: number
  discount?: number
  discount_code?: string
  delivery_charge?: number
  total: number
  status: string
  payment_method: string
  created_at: string
  address: string
  items: Array<{ name: string; price: number; quantity: number; total: number; selected_size?: string | null }>
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      const headers = await getCustomerAuthHeaders()
      const authResponse = await fetch('/api/auth/me', { headers })
      const authResult = await authResponse.json() as { authenticated: boolean }
      if (!authResult.authenticated) {
        setMessage('Sign in to view your orders.')
        setIsLoading(false)
        setIsCheckingAuth(false)
        return
      }

      const response = await fetch('/api/orders', { headers })
      const result = await response.json() as CustomerOrder[] | { error?: string }
      if (!response.ok) {
        setMessage((result as { error?: string }).error || 'Unable to load your orders.')
      } else if ((result as CustomerOrder[]).length === 0) {
        setMessage('No orders were found for your account.')
      } else {
        setOrders(result as CustomerOrder[])
      }
      setIsLoading(false)
      setIsCheckingAuth(false)
    }

    void loadOrders()
  }, [])

  return (
    <main className="min-h-screen bg-secondary/30 px-6 py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm text-primary">Back to shop</a>
        <div className="mt-5 max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Order tracking</p>
          <h1 className="mt-2 font-serif text-5xl text-foreground">Your orders</h1>
        </div>

        {isCheckingAuth || isLoading ? <p className="mt-8 text-sm text-muted-foreground">Loading your orders...</p> : null}

        {message ? <p className="mt-6 text-sm text-muted-foreground">{message}</p> : null}
        <div className="mt-8 space-y-5">
          {orders.map((order) => (
            <article key={order.order_number} className="rounded-2xl border border-border/70 bg-background p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
                <div><p className="text-xs uppercase tracking-[0.16em] text-primary">{order.order_number}</p><p className="mt-1 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p></div>
                <button type="button" onClick={() => void downloadOrderReceipt(order)} className="rounded-full border border-border px-4 py-2 text-xs text-foreground transition-colors hover:border-primary">Receipt</button>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">{statusLabels[order.status] || order.status}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">{order.items.map((item) => <div key={`${order.order_number}-${item.name}-${item.selected_size || ''}`} className="flex justify-between gap-4"><span>{item.name}{item.selected_size ? ` (Size ${item.selected_size})` : ''} × {item.quantity}</span><span>{formatPrice(item.total)}</span></div>)}</div>
              <div className="mt-5 grid gap-3 border-t border-border/60 pt-4 text-sm sm:grid-cols-3"><div><span className="block text-xs uppercase tracking-wide text-muted-foreground">Total</span><strong className="mt-1 block text-foreground">{formatPrice(order.total)}</strong></div><div><span className="block text-xs uppercase tracking-wide text-muted-foreground">Payment</span><strong className="mt-1 block capitalize text-foreground">{order.payment_method.replace('_', ' ')}</strong></div><div><span className="block text-xs uppercase tracking-wide text-muted-foreground">Delivery</span><strong className="mt-1 block text-foreground">{order.address}</strong></div></div>
            </article>
          ))}
        </div>
        {orders.length > 0 && !isLoading ? <CustomerReviewForm /> : null}
      </div>
    </main>
  )
}