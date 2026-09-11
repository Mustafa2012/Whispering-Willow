'use client'

import { useEffect, useState } from 'react'
import { PRODUCTS_STORAGE_KEY, products as defaultProducts, type Product } from '@/lib/products'

const emptyForm = {
  name: '',
  category: '',
  price: '',
  description: '',
  image: '/placeholder.svg',
}

function readStoredProducts(): Product[] {
  if (typeof window === 'undefined') {
    return defaultProducts
  }

  try {
    const saved = window.localStorage.getItem(PRODUCTS_STORAGE_KEY)
    if (!saved) {
      window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(defaultProducts))
      return defaultProducts
    }

    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProducts
  } catch {
    return defaultProducts
  }
}

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleProductsUpdated = () => {
      setMessage('')
    }

    window.addEventListener('whispering-willow-products-updated', handleProductsUpdated)
    return () => {
      window.removeEventListener('whispering-willow-products-updated', handleProductsUpdated)
    }
  }, [])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = form.name.trim()
    const category = form.category.trim()
    const description = form.description.trim()

    if (!name || !category || !description) {
      setMessage('Please add a product name, category, and description.')
      return
    }

    const nextProduct: Product = {
      name,
      category,
      price: form.price.trim() || 'Custom price',
      description,
      image: form.image.trim() || '/placeholder.svg',
    }

    const currentProducts = readStoredProducts()
    const updatedProducts = [nextProduct, ...currentProducts]

    window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts))
    window.dispatchEvent(new Event('whispering-willow-products-updated'))

    setForm(emptyForm)
    setMessage('Product added successfully.')
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="rounded-full bg-foreground px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-background shadow-lg transition-opacity hover:opacity-90"
      >
        Admin
      </button>

      {isOpen && (
        <div className="mt-3 w-[min(92vw,360px)] rounded-3xl border border-border/70 bg-background p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl text-foreground">Add product</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product name"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground"
            />
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground"
            />
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price (e.g. PKR 5,000)"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description"
              rows={3}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground"
            />
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="Image path or URL"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground"
            />

            {message ? <p className="text-xs text-primary">{message}</p> : null}

            <button
              type="submit"
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Save product
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
