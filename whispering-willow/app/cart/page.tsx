'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/products'
import { useCart } from '@/components/cart-provider'

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary/30 px-6">
        <div className="rounded-2xl border border-border/70 bg-background p-8 text-center">
          <h1 className="font-serif text-4xl text-foreground">Your cart is empty</h1>
          <p className="mt-3 text-muted-foreground">Add a piece from the shop to see it here.</p>
          <a href="/#shop" className="mt-6 inline-block rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground">Continue shopping</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-secondary/30 px-6 py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <a href="/#shop" className="text-sm text-primary">Continue shopping</a>
        <h1 className="mt-5 font-serif text-5xl text-foreground">Your cart</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            {items.map((item) => (
              <article key={item.name} className="flex gap-4 rounded-2xl border border-border/70 bg-background p-4">
                <img src={item.image || '/placeholder.svg'} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary">{item.category}</p>
                  <h2 className="mt-1 font-serif text-2xl text-foreground">{item.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{formatPrice(item.price)} each</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.name, item.quantity - 1)} className="rounded-full border border-border p-2 text-foreground hover:bg-secondary"><Minus className="h-4 w-4" /></button>
                    <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                    <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.name, item.quantity + 1)} className="rounded-full border border-border p-2 text-foreground hover:bg-secondary"><Plus className="h-4 w-4" /></button>
                    <button type="button" onClick={() => removeItem(item.name)} className="ml-2 inline-flex items-center gap-1 text-sm text-destructive hover:underline"><Trash2 className="h-4 w-4" />Remove</button>
                  </div>
                </div>
                <strong className="text-sm text-foreground">{formatPrice(item.price * item.quantity)}</strong>
              </article>
            ))}
          </section>
          <aside className="h-fit rounded-2xl border border-border/70 bg-background p-6">
            <h2 className="font-serif text-2xl text-foreground">Summary</h2>
            <div className="mt-5 flex justify-between border-t border-border pt-4 font-medium text-foreground"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <a href="/checkout" className="mt-6 block rounded-full bg-primary px-5 py-3 text-center text-sm text-primary-foreground">Proceed to checkout</a>
          </aside>
        </div>
      </div>
    </main>
  )
}