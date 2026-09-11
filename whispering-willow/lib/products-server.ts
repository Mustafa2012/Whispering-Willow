import { unstable_noStore as noStore } from 'next/cache'
import { products as defaultProducts, type Product } from '@/lib/products'

const supabaseUrl = process.env.SUPABASE_URL
  ?.replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '')
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function isProductDatabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey)
}

export async function getProducts(): Promise<Product[]> {
  noStore()

  if (!isProductDatabaseConfigured()) {
    return defaultProducts
  }

  const headers = {
    apikey: supabaseServiceRoleKey!,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,category,price,description,image&order=created_at.desc`, {
    headers,
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Supabase products request failed with status ${response.status}.`)
  }

  const storedProducts = (await response.json()) as Product[]
  const storedNames = new Set(storedProducts.map((product) => product.name))
  const missingProducts = defaultProducts.filter((product) => !storedNames.has(product.name))

  if (missingProducts.length === 0) {
    return storedProducts
  }

  const seedResponse = await fetch(`${supabaseUrl}/rest/v1/products`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(missingProducts),
  })

  if (!seedResponse.ok) {
    throw new Error('Unable to seed the existing product catalog.')
  }

  const seededProducts = (await seedResponse.json()) as Product[]
  return [...storedProducts, ...seededProducts]
}

export async function createProduct(product: Product) {
  if (!isProductDatabaseConfigured()) {
    throw new Error('Product database is not configured.')
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/products`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey!,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(product),
  })

  if (!response.ok) {
    throw new Error('Unable to save product to Supabase.')
  }
}

export async function deleteProduct(id: number) {
  if (!isProductDatabaseConfigured()) {
    throw new Error('Product database is not configured.')
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      apikey: supabaseServiceRoleKey!,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to delete product from Supabase.')
  }
}

export async function updateProduct(id: number, product: Product) {
  if (!isProductDatabaseConfigured()) {
    throw new Error('Product database is not configured.')
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: supabaseServiceRoleKey!,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(product),
  })

  if (!response.ok) {
    throw new Error('Unable to update product in Supabase.')
  }
}