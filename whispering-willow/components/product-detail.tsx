'use client'

import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { formatPrice, type Product } from '@/lib/products'
import { useCart } from '@/components/cart-provider'

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const sizes = product.sizes || []

  const handleAdd = () => {
    if (sizes.length && !selectedSize) return
    addItem(product, selectedSize || undefined, quantity)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2200)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 md:py-8">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/#shop" className="hover:text-foreground">Shop</Link>
          <span aria-hidden="true">/</span>
          <Link href="/#shop" className="hover:text-foreground">{product.category}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-14">
          <div className="group relative aspect-square cursor-zoom-in overflow-hidden bg-secondary/30">
            <img src={product.image || '/placeholder.svg'} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-150" />
          </div>

          <section className="pb-10 lg:pt-1">
            <p className="text-sm uppercase tracking-[0.18em] text-primary">{product.category}</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-2xl text-foreground">{formatPrice(product.price)}</p>
            <p className="mt-7 flex items-center gap-2 text-sm text-muted-foreground">
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${product.isActive === false ? 'bg-destructive' : 'bg-emerald-500'}`} />
              {product.isActive === false ? 'Currently unavailable' : 'In Stock'}
            </p>
            <p className="mt-8 border-b border-border pb-8 text-base leading-relaxed text-muted-foreground">{product.description}</p>

            {sizes.length ? (
              <fieldset className="mt-8">
                <legend className="mb-4 text-sm font-medium uppercase tracking-wide text-foreground">Select size</legend>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <button key={size} type="button" onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size} className={`grid h-16 min-w-16 place-items-center border px-4 text-base transition-colors ${selectedSize === size ? 'border-foreground bg-foreground text-background' : 'border-border text-foreground hover:border-foreground'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="mt-8 flex h-14 w-fit items-stretch border border-border" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid w-14 place-items-center text-foreground hover:bg-secondary"><Minus className="h-4 w-4" /></button>
              <span className="grid w-14 place-items-center border-x border-border text-sm" aria-live="polite">{quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(99, value + 1))} className="grid w-14 place-items-center text-foreground hover:bg-secondary"><Plus className="h-4 w-4" /></button>
            </div>

            <button type="button" onClick={handleAdd} disabled={product.isActive === false || (sizes.length > 0 && !selectedSize)} className="mt-6 flex min-h-16 w-full items-center justify-center gap-3 bg-primary px-6 text-base uppercase tracking-[0.12em] text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              <ShoppingBag className="h-5 w-5" />
              {added ? 'Added to cart' : 'Add to cart'}
            </button>
            {sizes.length && !selectedSize ? <p className="mt-2 text-sm text-muted-foreground">Choose a size to continue.</p> : null}
            <p className="mt-5 bg-secondary/50 px-4 py-4 text-center text-sm text-muted-foreground">Cash on Delivery available — Pay when you receive your order</p>
          </section>
        </div>
      </div>

    </main>
  )
}