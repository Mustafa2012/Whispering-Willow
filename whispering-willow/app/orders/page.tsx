'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/products'
import { getCustomerAuthHeaders } from '@/lib/customer-browser'

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

  function generateReceipt(order: CustomerOrder) {
    const items = order.items.map((item) => `<tr><td>${item.name} x ${item.quantity}</td><td>${formatPrice(item.total)}</td></tr>`).join('')
    const receiptHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${order.order_number}</title><style>body{font-family:Arial,sans-serif;max-width:680px;margin:48px auto;padding:0 24px;color:#332d27}h1{font-size:28px}p{color:#6f665d}.header{display:flex;justify-content:space-between;border-bottom:1px solid #d8d0c5;padding-bottom:20px}.details{margin:24px 0}table{width:100%;border-collapse:collapse}td{padding:10px 0;border-bottom:1px solid #e6dfd6}td:last-child{text-align:right}.total{font-weight:700;font-size:18px;text-align:right;margin-top:24px}</style></head><body><div class="header"><div><h1>Whispering Willow</h1><p>Order receipt</p></div><div><strong>${order.order_number}</strong><p>${new Date(order.created_at).toLocaleDateString()}</p></div></div><div class="details"><p><strong>Status:</strong> ${statusLabels[order.status] || order.status}</p><p><strong>Payment:</strong> ${order.payment_method.replace('_', ' ')}</p><p><strong>Delivery:</strong> ${order.address}</p></div><table>${items}</table><p class="total">Total: ${formatPrice(order.total)}</p></body></html>`
    const receiptUrl = URL.createObjectURL(new Blob([receiptHtml], { type: 'text/html' }))
    const downloadLink = document.createElement('a')
    downloadLink.href = receiptUrl
    downloadLink.download = `receipt-${order.order_number}.html`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()
    URL.revokeObjectURL(receiptUrl)
  }

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
                <button type="button" onClick={() => generateReceipt(order)} className="rounded-full border border-border px-4 py-2 text-xs text-foreground transition-colors hover:border-primary">Receipt</button>
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