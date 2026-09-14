'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/lib/products'

const emptyForm = {
  name: '',
  category: '',
  price: '',
  description: '',
  image: '/placeholder.svg',
}

type ProductForm = typeof emptyForm
type AdminOrder = {
  id: number
  order_number?: string
  customer_name: string
  email: string
  phone: string
  address: string
  payment_method: string
  proof_url?: string
  total: number
  status: string
  created_at?: string
}
const adminSessionKey = 'whispering-willow-admin-authenticated'
const adminPasswordSessionKey = 'whispering-willow-admin-password'

export function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const sessionPassword = sessionStorage.getItem(adminPasswordSessionKey)

    if (sessionStorage.getItem(adminSessionKey) !== 'true' || !sessionPassword) {
      window.location.replace('/')
      return
    }

    setPassword(sessionPassword)
    setIsAuthorized(true)
  }, [])

  useEffect(() => {
    if (!isAuthorized) {
      return
    }

    Promise.all([fetch('/api/products'), fetch('/api/admin/orders', { headers: { 'x-admin-password': password } })])
      .then(async ([productsResponse, ordersResponse]) => {
        if (!productsResponse.ok) throw new Error('Unable to load products.')
        const loadedOrders = ordersResponse.ok ? await ordersResponse.json() as AdminOrder[] : []
        setOrders(loadedOrders)
        return productsResponse.json() as Promise<Product[]>
      })
      .then(setProducts)
      .catch(() => setMessage('Unable to load products. Check your database configuration.'))
      .finally(() => setIsLoading(false))
  }, [isAuthorized])

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleImageUpload = async (file?: File) => {
    if (!file) {
      return
    }

    if (!password) {
      setMessage('Enter the admin password before uploading an image.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.')
      return
    }

    setIsUploading(true)
    setMessage('')
    const body = new FormData()
    body.append('file', file)

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'x-admin-password': password },
      body,
    })

    if (!response.ok) {
      const result = (await response.json()) as { error?: string }
      setMessage(result.error || 'Unable to upload image.')
      setIsUploading(false)
      return
    }

    const result = (await response.json()) as { url: string }
    setForm((current) => ({ ...current, image: result.url }))
    setMessage('Image uploaded. Save the product to keep this image.')
    setIsUploading(false)
  }

  const selectProduct = (product: Product) => {
    setSelectedProduct(product)
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      description: product.description,
      image: product.image,
    })
    setMessage('')
  }

  const startNewProduct = () => {
    setSelectedProduct(null)
    setForm(emptyForm)
    setMessage('')
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')

    const product = {
      ...form,
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price) || 0,
      description: form.description.trim(),
      image: form.image.trim() || '/placeholder.svg',
    }

    if (!product.name || !product.category || !product.description) {
      setMessage('Name, category, and description are required.')
      setIsSaving(false)
      return
    }

    const response = await fetch('/api/products', {
      method: selectedProduct ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify(selectedProduct ? { ...product, id: selectedProduct.id } : product),
    })

    if (!response.ok) {
      const result = (await response.json()) as { error?: string }
      setMessage(result.error || 'Unable to save product.')
      setIsSaving(false)
      return
    }

    if (selectedProduct) {
      const updatedProduct = { ...selectedProduct, ...product }
      setProducts((current) => current.map((item) => item.id === selectedProduct.id ? updatedProduct : item))
      setSelectedProduct(updatedProduct)
      setMessage('Product updated.')
    } else {
      const refreshedProducts = await fetch('/api/products').then((result) => result.json() as Promise<Product[]>)
      setProducts(refreshedProducts)
      setForm(emptyForm)
      setMessage('Product added.')
    }

    setIsSaving(false)
  }

  const handleDelete = async (product: Product) => {
    if (!product.id || !window.confirm(`Remove ${product.name}?`)) {
      return
    }

    const response = await fetch('/api/products', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({ id: product.id }),
    })

    if (!response.ok) {
      const result = (await response.json()) as { error?: string }
      setMessage(result.error || 'Unable to remove product.')
      return
    }

    setProducts((current) => current.filter((item) => item.id !== product.id))
    if (selectedProduct?.id === product.id) {
      startNewProduct()
    }
    setMessage('Product removed.')
  }

  const updateOrder = async (order: AdminOrder, status: string) => {
    const response = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: order.id, status }),
    })
    if (response.ok) setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item))
    else setMessage('Unable to update order.')
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <main className="min-h-screen bg-secondary/30 px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-border/70 pb-8 md:flex-row md:items-end">
          <div>
            <a href="/" className="text-xs uppercase tracking-[0.24em] text-primary hover:text-foreground">
              Back to storefront
            </a>
            <h1 className="mt-4 font-serif text-5xl text-foreground md:text-6xl">Product studio</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Keep the shared Whispering Willow catalog current from one place.
            </p>
          </div>
          <button
            type="button"
            onClick={startNewProduct}
            className="rounded-full bg-foreground px-5 py-3 text-sm text-background transition-opacity hover:opacity-85"
          >
            Add new product
          </button>
        </div>

        {message ? <p className="mb-6 text-sm text-primary">{message}</p> : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-serif text-3xl text-foreground">All products</h2>
              <span className="text-sm text-muted-foreground">{products.length} items</span>
            </div>

            {isLoading ? <p className="text-muted-foreground">Loading products...</p> : null}
            {!isLoading && products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
                No products found.
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id ?? product.name}
                  className={`overflow-hidden rounded-2xl border bg-background transition-colors ${selectedProduct?.id === product.id ? 'border-primary' : 'border-border/70'}`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    <img src={product.image || '/placeholder.svg'} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-primary">{product.category}</p>
                    <h3 className="mt-2 truncate font-serif text-xl text-foreground">{product.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{product.price}</p>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => selectProduct(product)}
                        className="flex-1 rounded-full bg-primary px-3 py-2 text-xs text-primary-foreground transition-opacity hover:opacity-85"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="rounded-full border border-destructive/50 px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 border-t border-border/70 pt-8">
              <div className="mb-4 flex items-baseline justify-between"><h2 className="font-serif text-3xl text-foreground">Orders</h2><span className="text-sm text-muted-foreground">{orders.filter((order) => order.status === 'pending').length} pending</span></div>
              {orders.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet. Orders will appear here after checkout.</p> : <div className="space-y-3">{orders.map((order) => <article key={order.id} className="rounded-2xl border border-border/70 bg-background p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.16em] text-primary">Order #{order.order_number || order.id}</p><h3 className="mt-1 font-serif text-xl">{order.customer_name}</h3><p className="text-sm text-muted-foreground">{order.email} · {order.phone}</p><p className="mt-2 text-sm">{order.address}</p>{order.proof_url ? <a href={order.proof_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary">View transfer proof</a> : null}</div><div className="flex items-end gap-3"><div className="text-right"><p className="font-serif text-lg">PKR {Number(order.total).toLocaleString('en-PK')}</p><p className="text-xs uppercase text-muted-foreground">{order.payment_method}</p></div><select value={order.status} onChange={(event) => void updateOrder(order, event.target.value)} className="rounded-xl border border-border bg-card px-3 py-2 text-sm"><option>pending</option><option>confirmed</option><option>processing</option><option>shipped</option><option>completed</option><option>cancelled</option></select></div></div></article>)}</div>}
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-border/70 bg-background p-5 lg:sticky lg:top-24">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-primary">{selectedProduct ? 'Editing' : 'New item'}</p>
                <h2 className="mt-1 font-serif text-2xl text-foreground">{selectedProduct?.name || 'Add product'}</h2>
              </div>
              {selectedProduct ? (
                <button type="button" onClick={startNewProduct} className="text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              ) : null}
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <input name="name" value={form.name} onChange={handleFormChange} placeholder="Product name" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <input name="category" value={form.category} onChange={handleFormChange} placeholder="Category" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <input name="price" value={form.price} onChange={handleFormChange} placeholder="Price" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Short description" rows={5} required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  void handleImageUpload(event.dataTransfer.files[0])
                }}
                className="rounded-xl border border-dashed border-primary/50 bg-secondary/30 p-3"
              >
                <label className="flex cursor-pointer flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                  <span>{isUploading ? 'Uploading image...' : 'Drag an image here or choose a file'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => void handleImageUpload(event.target.files?.[0])}
                    className="sr-only"
                    disabled={isUploading}
                  />
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground">Choose image</span>
                </label>
              </div>
              <button type="submit" disabled={isSaving} className="w-full rounded-full bg-primary px-4 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60">
                {isSaving ? 'Saving...' : selectedProduct ? 'Save changes' : 'Add product'}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  )
}
