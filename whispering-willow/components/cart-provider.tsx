'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/products'

export type CartItem = Product & { quantity: number }

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (product: Product) => void
  updateQuantity: (productName: string, quantity: number) => void
  removeItem: (productName: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const storageKey = 'whispering-willow-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    if (stored) {
      try {
        setItems(JSON.parse(stored) as CartItem[])
      } catch {
        window.localStorage.removeItem(storageKey)
      }
    }
    setHasLoaded(true)
  }, [])

  useEffect(() => {
    if (!hasLoaded) return
    window.localStorage.setItem(storageKey, JSON.stringify(items))
  }, [hasLoaded, items])

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    addItem: (product) => setItems((current) => {
      const existing = current.find((item) => item.name === product.name)
      if (existing) {
        return current.map((item) => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...current, { ...product, quantity: 1 }]
    }),
    updateQuantity: (productName, quantity) => setItems((current) => quantity > 0
      ? current.map((item) => item.name === productName ? { ...item, quantity } : item)
      : current.filter((item) => item.name !== productName)),
    removeItem: (productName) => setItems((current) => current.filter((item) => item.name !== productName)),
    clearCart: () => setItems([]),
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}