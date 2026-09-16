'use client'

import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/products'
import { useCart } from '@/components/cart-provider'

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, subtotal, updateQuantity, removeItem } = useCart()

  return (
    <>
      {isOpen ? <button type="button" aria-label="Close cart" onClick={onClose} className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-[3px]" /> : null}
      <aside
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-[70] flex h-screen w-[min(92vw,420px)] flex-col border-l border-border/70 bg-background shadow-2xl transition-[transform,visibility] duration-300 ease-out md:w-1/4 ${isOpen ? 'visible translate-x-0 [transition-delay:0s,0s]' : 'pointer-events-none invisible translate-x-full [transition-delay:0s,300ms]'}`}
      >
        <button type="button" onClick={onClose} aria-label="Close cart" title="Close cart" className="absolute left-0 top-1/2 z-10 flex h-12 w-9 -translate-y-1/2 items-center justify-center rounded-r-md bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/85"><ArrowRight className="h-5 w-5" /></button>
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-2xl text-foreground">Your cart</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close cart" title="Close cart" className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"><ArrowRight className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-9 w-9 text-primary" />
              <p className="mt-4 font-serif text-2xl text-foreground">Your cart is empty</p>
              <p className="mt-2 text-sm text-muted-foreground">Add something beautiful from the shop.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <article key={item.name} className="flex gap-3 border-b border-border/60 pb-4">
                  <img src={item.image || '/placeholder.svg'} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2"><h3 className="truncate font-serif text-lg text-foreground">{item.name}</h3><button type="button" onClick={() => removeItem(item.name)} aria-label={`Remove ${item.name}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div>
                    <p className="mt-1 text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" onClick={() => updateQuantity(item.name, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`} className="rounded-full border border-border p-1.5 hover:bg-secondary"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="min-w-5 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.name, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`} className="rounded-full border border-border p-1.5 hover:bg-secondary"><Plus className="h-3.5 w-3.5" /></button>
                      <span className="ml-auto text-sm font-medium text-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 ? <div className="border-t border-border/70 bg-secondary/20 p-5"><div className="flex justify-between text-base font-medium text-foreground"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><a href="/checkout" onClick={onClose} className="mt-4 block rounded-full bg-primary px-5 py-3 text-center text-sm text-primary-foreground transition-opacity hover:opacity-90">Proceed to checkout</a><a href="/cart" onClick={onClose} className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">View full cart</a></div> : null}
      </aside>
    </>
  )
}