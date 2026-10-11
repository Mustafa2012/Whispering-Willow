'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/products'

export type CartItem = Product & { quantity: number; selectedSize?: string }

export function getCartItemKey(item: Pick<CartItem, 'id' | 'name' | 'selectedSize'>) {
  return `${item.id ?? item.name}::${item.selectedSize || ''}`
}

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (product: Product, selectedSize?: string, quantity?: number) => void
  updateQuantity: (itemKey: string, quantity: number) => void
  removeItem: (itemKey: string) => void
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
    addItem: (product, selectedSize, quantity = 1) => setItems((current) => {
      const itemKey = getCartItemKey({ ...product, selectedSize })
      const existing = current.find((item) => getCartItemKey(item) === itemKey)
      if (existing) {
        return current.map((item) => getCartItemKey(item) === itemKey ? { ...item, quantity: item.quantity + quantity } : item)
      }
      return [...current, { ...product, selectedSize, quantity }]
    }),
    updateQuantity: (itemKey, quantity) => setItems((current) => quantity > 0
      ? current.map((item) => getCartItemKey(item) === itemKey ? { ...item, quantity } : item)
      : current.filter((item) => getCartItemKey(item) !== itemKey)),
    removeItem: (itemKey) => setItems((current) => current.filter((item) => getCartItemKey(item) !== itemKey)),
    clearCart: () => setItems([]),
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}