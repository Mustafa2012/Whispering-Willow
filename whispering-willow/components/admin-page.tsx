'use client'

import { useEffect, useState } from 'react'
import { PRODUCT_CATEGORIES, type Product } from '@/lib/products'
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from '@/lib/shipping-settings'
import { adminPasswordSessionKey, hasAdminAccess } from '@/lib/admin-browser'

const emptyForm = {
  name: '',
  category: '',
  price: '',
  description: '',
  image: '/placeholder.svg',
  sizes: '',
}

type ProductForm = typeof emptyForm
type DiscountCode = { id: number; code: string; discount_type: 'percentage' | 'fixed'; value: number; is_active: boolean; expires_at?: string; usage_limit?: number | null; usage_count: number }
type ShippingSettingsForm = {
  deliveryCharge: string
  freeShippingEnabled: boolean
  freeShippingThreshold: string
}
export function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [adminEmails, setAdminEmails] = useState<string[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [isSavingAdminEmail, setIsSavingAdminEmail] = useState(false)
  const [discountForm, setDiscountForm] = useState({ code: '', discountType: 'percentage', value: '', expiresAt: '', usageLimit: '' })
  const [shippingSettings, setShippingSettings] = useState<ShippingSettingsForm>({
    deliveryCharge: String(DEFAULT_SHIPPING_SETTINGS.deliveryCharge),
    freeShippingEnabled: DEFAULT_SHIPPING_SETTINGS.freeShippingEnabled,
    freeShippingThreshold: String(DEFAULT_SHIPPING_SETTINGS.freeShippingThreshold),
  })
  const categoryOptions = Array.from(new Set([
    ...PRODUCT_CATEGORIES,
    ...(selectedProduct ? [selectedProduct.category] : []),
  ]))

  useEffect(() => {
    const sessionPassword = sessionStorage.getItem(adminPasswordSessionKey)

    void hasAdminAccess().then((authorized) => {
      if (!authorized) {
        window.location.replace('/')
        return
      }
      setPassword(sessionPassword || '')
      setIsAuthorized(true)
    })
  }, [])

  useEffect(() => {
    if (!isAuthorized) {
      return
    }

    Promise.all([
      fetch('/api/products'),
      fetch('/api/admin/discounts', { headers: { 'x-admin-password': password } }),
      fetch('/api/admin/shipping-settings', { headers: { 'x-admin-password': password } }),
      fetch('/api/admin/emails', { headers: { 'x-admin-password': password } }),
    ])
      .then(async ([productResponse, discountResponse, shippingResponse, emailResponse]) => {
        if (!productResponse.ok) throw new Error('Unable to load products.')
        if (discountResponse.ok) setDiscountCodes(await discountResponse.json() as DiscountCode[])
        if (!shippingResponse.ok) {
          const result = await shippingResponse.json() as { error?: string }
          throw new Error(result.error || 'Unable to load shipping settings.')
        }
        const settings = await shippingResponse.json() as ShippingSettings
        if (!emailResponse.ok) {
          const result = await emailResponse.json() as { error?: string }
          throw new Error(result.error || 'Unable to load authorized admin emails.')
        }
        setAdminEmails(await emailResponse.json() as string[])
        setShippingSettings({
          deliveryCharge: String(settings.deliveryCharge),
          freeShippingEnabled: settings.freeShippingEnabled,
          freeShippingThreshold: String(settings.freeShippingThreshold),
        })
        return productResponse.json() as Promise<Product[]>
      })
      .then(setProducts)
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Unable to load admin data.'))
      .finally(() => setIsLoading(false))
  }, [isAuthorized])

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleImageUpload = async (file?: File) => {
    if (!file) {
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
      sizes: product.sizes?.join(', ') || '',
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
      sizes: Array.from(new Set(form.sizes.split(',').map((size) => size.trim()).filter(Boolean))),
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

  const createDiscountCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await fetch('/api/admin/discounts', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ code: discountForm.code, discountType: discountForm.discountType, value: Number(discountForm.value), expiresAt: discountForm.expiresAt || undefined, usageLimit: discountForm.usageLimit ? Number(discountForm.usageLimit) : null }) })
    const result = await response.json() as DiscountCode | { error?: string }
    if (!response.ok) { setMessage((result as { error?: string }).error || 'Unable to create discount code.'); return }
    setDiscountCodes((current) => [result as DiscountCode, ...current])
    setDiscountForm({ code: '', discountType: 'percentage', value: '', expiresAt: '', usageLimit: '' })
    setMessage('Discount code created.')
  }

  const toggleDiscountCode = async (discount: DiscountCode) => {
    const response = await fetch('/api/admin/discounts', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ id: discount.id, isActive: !discount.is_active }) })
    if (response.ok) setDiscountCodes((current) => current.map((item) => item.id === discount.id ? { ...item, is_active: !item.is_active } : item))
  }

  const deleteDiscountCode = async (discount: DiscountCode) => {
    if (!window.confirm(`Delete ${discount.code}?`)) return
    const response = await fetch(`/api/admin/discounts?id=${discount.id}`, { method: 'DELETE', headers: { 'x-admin-password': password } })
    if (response.ok) setDiscountCodes((current) => current.filter((item) => item.id !== discount.id))
  }

  const saveShippingSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await fetch('/api/admin/shipping-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({
        deliveryCharge: Number(shippingSettings.deliveryCharge),
        freeShippingEnabled: shippingSettings.freeShippingEnabled,
        freeShippingThreshold: Number(shippingSettings.freeShippingThreshold),
      }),
    })
    const result = await response.json() as ShippingSettings | { error?: string }
    if (!response.ok) {
      setMessage((result as { error?: string }).error || 'Unable to save shipping settings.')
      return
    }
    const saved = result as ShippingSettings
    setShippingSettings({
      deliveryCharge: String(saved.deliveryCharge),
      freeShippingEnabled: saved.freeShippingEnabled,
      freeShippingThreshold: String(saved.freeShippingThreshold),
    })
    setMessage('Shipping settings saved.')
  }

  const addAdminEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingAdminEmail(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ email: newAdminEmail }),
      })
      const result = await response.json() as { email?: string; error?: string }
      if (!response.ok || !result.email) throw new Error(result.error || 'Unable to add the admin email.')
      const addedEmail = result.email
      setAdminEmails((current) => [...current, addedEmail].sort())
      setNewAdminEmail('')
      setMessage('Admin email added.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to add the admin email.')
    } finally {
      setIsSavingAdminEmail(false)
    }
  }

  const removeAdminEmail = async (email: string) => {
    if (!window.confirm(`Remove admin access for ${email}?`)) return
    const response = await fetch(`/api/admin/emails?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    const result = await response.json() as { error?: string }
    if (!response.ok) {
      setMessage(result.error || 'Unable to remove the admin email.')
      return
    }
    setAdminEmails((current) => current.filter((item) => item !== email))
    setMessage('Admin email removed.')
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
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-primary">Admin</p>
            <h1 className="mt-2 font-serif text-5xl text-foreground md:text-6xl">Inventory</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Keep the shared Whispering Willow catalog current.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/admin/orders" className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground transition-colors hover:border-primary">Orders dashboard</a>
            <a href="/admin/reviews" className="rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground transition-colors hover:border-primary">Store reviews</a>
            <button type="button" onClick={startNewProduct} className="rounded-full bg-foreground px-5 py-3 text-sm text-background transition-opacity hover:opacity-85">Add new product</button>
          </div>
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
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-serif text-3xl text-foreground">Admin email access</h2>
                <span className="text-sm text-muted-foreground">{adminEmails.length} emails</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">These Google accounts can sign in to the admin panel. Each person must verify their email with Google.</p>
              <form onSubmit={addAdminEmail} className="flex flex-col gap-3 sm:flex-row">
                <input
                  required
                  type="email"
                  value={newAdminEmail}
                  onChange={(event) => setNewAdminEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                />
                <button type="submit" disabled={isSavingAdminEmail} className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60">
                  {isSavingAdminEmail ? 'Adding...' : 'Add email'}
                </button>
              </form>
              <div className="mt-4 space-y-2">
                {adminEmails.map((email) => (
                  <div key={email} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3">
                    <span className="text-sm text-foreground">{email}</span>
                    <button type="button" onClick={() => void removeAdminEmail(email)} className="rounded-full border border-destructive/50 px-3 py-1 text-xs text-destructive">Remove</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 border-t border-border/70 pt-8">
              <div className="mb-4 flex items-baseline justify-between"><h2 className="font-serif text-3xl text-foreground">Discount codes</h2><span className="text-sm text-muted-foreground">{discountCodes.length} codes</span></div>
              <form onSubmit={createDiscountCode} className="grid gap-3 rounded-2xl border border-border/70 bg-background p-4 md:grid-cols-5">
                <input required value={discountForm.code} onChange={(event) => setDiscountForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="Code e.g. WILLOW10" className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none" />
                <select value={discountForm.discountType} onChange={(event) => setDiscountForm((current) => ({ ...current, discountType: event.target.value }))} className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none"><option value="percentage">Percentage</option><option value="fixed">Fixed PKR</option></select>
                <input required type="number" min={discountForm.discountType === 'percentage' ? 1 : 0.01} step={discountForm.discountType === 'percentage' ? 1 : 0.01} value={discountForm.value} onChange={(event) => setDiscountForm((current) => ({ ...current, value: event.target.value }))} placeholder="Value" className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none" />
                <input type="date" value={discountForm.expiresAt} onChange={(event) => setDiscountForm((current) => ({ ...current, expiresAt: event.target.value }))} className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none" />
                <button type="submit" className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground">Create code</button>
                <input type="number" min="1" value={discountForm.usageLimit} onChange={(event) => setDiscountForm((current) => ({ ...current, usageLimit: event.target.value }))} placeholder="Usage limit (optional)" className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none md:col-span-2" />
              </form>
              <div className="mt-4 space-y-2">{discountCodes.map((discount) => <div key={discount.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3"><div><strong className="text-sm tracking-wide text-foreground">{discount.code}</strong><span className="ml-3 text-sm text-muted-foreground">{discount.discount_type === 'percentage' ? `${discount.value}% off` : `${discount.value} PKR off`} · {discount.usage_count}{discount.usage_limit ? `/${discount.usage_limit}` : ''} uses</span></div><div className="flex gap-2"><button type="button" onClick={() => void toggleDiscountCode(discount)} className="rounded-full border border-border px-3 py-1 text-xs">{discount.is_active ? 'Active' : 'Inactive'}</button><button type="button" onClick={() => void deleteDiscountCode(discount)} className="rounded-full border border-destructive/50 px-3 py-1 text-xs text-destructive">Delete</button></div></div>)}</div>
            </div>

            <div className="mt-12 border-t border-border/70 pt-8">
              <h2 className="mb-4 font-serif text-3xl text-foreground">Shipping settings</h2>
              <form onSubmit={saveShippingSettings} className="space-y-4 rounded-2xl border border-border/70 bg-background p-5">
                <label className="block space-y-2 text-sm text-foreground">
                  <span>Delivery charge (PKR)</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingSettings.deliveryCharge}
                    onChange={(event) => setShippingSettings((current) => ({ ...current, deliveryCharge: event.target.value }))}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 outline-none"
                  />
                </label>
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={shippingSettings.freeShippingEnabled}
                    onChange={(event) => setShippingSettings((current) => ({ ...current, freeShippingEnabled: event.target.checked }))}
                    className="h-4 w-4 accent-primary"
                  />
                  Enable free shipping above a minimum order
                </label>
                <label className="block space-y-2 text-sm text-foreground">
                  <span>Free shipping minimum order (PKR)</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(event) => setShippingSettings((current) => ({ ...current, freeShippingThreshold: event.target.value }))}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 outline-none disabled:opacity-50"
                    disabled={!shippingSettings.freeShippingEnabled}
                  />
                </label>
                <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-85">
                  Save shipping settings
                </button>
              </form>
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
              <label>
                <span className="sr-only">Category</span>
                <select name="category" value={form.category} onChange={handleFormChange} required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none">
                  <option value="" disabled>Select category</option>
                  {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <input name="price" value={form.price} onChange={handleFormChange} placeholder="Price" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <input name="sizes" value={form.sizes} onChange={handleFormChange} placeholder="Sizes (comma-separated, optional)" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
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
