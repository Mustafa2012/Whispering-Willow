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

  async function generateReceipt(order: CustomerOrder) {
    const width = 900
    const lineHeight = 42
    const height = 470 + order.items.length * lineHeight
    const canvas = document.createElement('canvas')
    canvas.width = width * 2
    canvas.height = height * 2
    const context = canvas.getContext('2d')
    if (!context) return

    context.scale(2, 2)
    context.fillStyle = '#fbf8f2'
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#332d27'
    context.font = 'bold 34px Georgia, serif'
    context.fillText('Whispering Willow', 60, 70)
    context.font = '20px Arial, sans-serif'
    context.fillStyle = '#6f665d'
    context.fillText('Order receipt', 60, 105)
    context.textAlign = 'right'
    context.fillStyle = '#332d27'
    context.font = 'bold 22px Arial, sans-serif'
    context.fillText(order.order_number, width - 60, 70)
    context.font = '18px Arial, sans-serif'
    context.fillStyle = '#6f665d'
    context.fillText(new Date(order.created_at).toLocaleDateString(), width - 60, 105)
    context.textAlign = 'left'
    context.strokeStyle = '#d8d0c5'
    context.beginPath()
    context.moveTo(60, 135)
    context.lineTo(width - 60, 135)
    context.stroke()
    context.fillStyle = '#332d27'
    context.font = '18px Arial, sans-serif'
    context.fillText(`Status: ${statusLabels[order.status] || order.status}`, 60, 180)
    context.fillText(`Payment: ${order.payment_method.replace('_', ' ')}`, 60, 215)
    context.fillText(`Delivery: ${order.address}`, 60, 250)
    let itemY = 315
    order.items.forEach((item) => {
      context.fillStyle = '#6f665d'
      context.fillText(`${item.name} x ${item.quantity}`, 60, itemY)
      context.textAlign = 'right'
      context.fillStyle = '#332d27'
      context.fillText(formatPrice(item.total), width - 60, itemY)
      context.textAlign = 'left'
      context.strokeStyle = '#e6dfd6'
      context.beginPath()
      context.moveTo(60, itemY + 14)
      context.lineTo(width - 60, itemY + 14)
      context.stroke()
      itemY += lineHeight
    })
    context.textAlign = 'right'
    context.font = 'bold 24px Arial, sans-serif'
    context.fillStyle = '#332d27'
    context.fillText(`Total: ${formatPrice(order.total)}`, width - 60, itemY + 35)

    const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!imageBlob) return
    const receiptUrl = URL.createObjectURL(imageBlob)
    const downloadLink = document.createElement('a')
    downloadLink.href = receiptUrl
    downloadLink.download = `receipt-${order.order_number}.png`
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