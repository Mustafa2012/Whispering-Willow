'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formatPrice } from '@/lib/products'
import { useCart } from '@/components/cart-provider'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [proofUrl, setProofUrl] = useState('')
  const [message, setMessage] = useState('')

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: form.get('customerName'), email: form.get('email'), phone: form.get('phone'), address: form.get('address'), notes: form.get('notes'), paymentMethod,
        transactionReference: form.get('transactionReference'), proofUrl, items: items.map((item) => ({ name: item.name, quantity: item.quantity })),
      }),
    })
    const result = await response.json() as { orderNumber?: string | number; error?: string }
    if (!response.ok) {
      setMessage(result.error || 'Unable to place order.')
      setIsSubmitting(false)
      return
    }
    clearCart()
    router.push(`/checkout/success?order=${result.orderNumber}`)
  }

  async function uploadProof(file?: File) {
    if (!file) return
    setIsUploading(true)
    const body = new FormData()
    body.append('file', file)
    const response = await fetch('/api/orders/upload', { method: 'POST', body })
    const result = await response.json() as { url?: string; error?: string }
    setMessage(response.ok ? '' : result.error || 'Unable to upload proof.')
    if (result.url) setProofUrl(result.url)
    setIsUploading(false)
  }

  if (items.length === 0) {
    return <main className="mx-auto min-h-screen max-w-3xl px-6 py-20 text-center"><h1 className="font-serif text-4xl">Your cart is empty</h1><a href="/#shop" className="mt-6 inline-block rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground">Continue shopping</a></main>
  }

  return <main className="min-h-screen bg-secondary/30 px-6 py-12 md:py-20">
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-border/70 bg-background p-6 md:p-8">
        <a href="/#shop" className="text-sm text-primary">Back to shop</a>
        <h1 className="mt-5 font-serif text-4xl">Checkout</h1>
        <form onSubmit={submitOrder} className="mt-8 space-y-4">
          <input name="customerName" required placeholder="Full name" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none" />
          <div className="grid gap-4 sm:grid-cols-2"><input name="email" type="email" required placeholder="Email address" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none" /><input name="phone" required placeholder="Phone number" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none" /></div>
          <textarea name="address" required rows={4} placeholder="Complete delivery address" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none" />
          <div className="grid gap-3 sm:grid-cols-2"><label className={`rounded-xl border p-4 ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'}`}><input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mr-2" />Cash on delivery</label><label className={`rounded-xl border p-4 ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border'}`}><input type="radio" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="mr-2" />Bank transfer</label></div>
          {paymentMethod === 'bank_transfer' ? <div className="space-y-3 rounded-xl bg-secondary/30 p-4 text-sm"><p className="font-medium">Transfer to: Whispering Willow, Meezan Bank, Account 0000000000</p><input name="transactionReference" required placeholder="Transaction reference" className="w-full rounded-xl border border-border bg-card px-4 py-3 outline-none" /><label className="block rounded-xl border border-dashed border-primary/50 p-4 text-center"><span className="block text-muted-foreground">{isUploading ? 'Uploading proof...' : proofUrl ? 'Proof uploaded' : 'Upload transaction proof'}</span><input type="file" accept="image/*" required={!proofUrl} onChange={(event) => void uploadProof(event.target.files?.[0])} className="sr-only" /></label></div> : null}
          <textarea name="notes" rows={3} placeholder="Order notes (optional)" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none" />
          {message ? <p className="text-sm text-destructive">{message}</p> : null}
          <button disabled={isSubmitting} className="w-full rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground disabled:opacity-60">{isSubmitting ? 'Placing order...' : 'Place order'}</button>
        </form>
      </section>
      <aside className="h-fit rounded-2xl border border-border/70 bg-background p-6"><h2 className="font-serif text-2xl">Order summary</h2><div className="mt-5 space-y-3">{items.map((item) => <div key={item.name} className="flex justify-between gap-3 text-sm"><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></div>)}</div><div className="mt-6 flex justify-between border-t border-border pt-4 font-medium"><span>Total</span><span>{formatPrice(subtotal)}</span></div></aside>
    </div>
  </main>
}