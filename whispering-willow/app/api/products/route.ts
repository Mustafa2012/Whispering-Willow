import { NextResponse } from 'next/server'
import {
  createProduct,
  deleteProduct,
  getProducts,
  isProductDatabaseConfigured,
  updateProduct,
} from '@/lib/products-server'
import type { Product } from '@/lib/products'

export async function GET() {
  try {
    return NextResponse.json(await getProducts())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load products.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isProductDatabaseConfigured() || !process.env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ error: 'Product administration is not configured.' }, { status: 503 })
  }

  if (request.headers.get('x-admin-password') !== process.env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ error: 'Invalid admin password.' }, { status: 401 })
  }

  try {
    const product = (await request.json()) as Partial<Product>
    const name = product.name?.trim()
    const category = product.category?.trim()
    const description = product.description?.trim()

    if (!name || !category || !description) {
      return NextResponse.json(
        { error: 'Name, category, and description are required.' },
        { status: 400 },
      )
    }

    await createProduct({
      name,
      category,
      price: product.price?.trim() || 'Custom price',
      description,
      image: product.image?.trim() || '/placeholder.svg',
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to save product.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!isProductDatabaseConfigured() || !process.env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ error: 'Product administration is not configured.' }, { status: 503 })
  }

  if (request.headers.get('x-admin-password') !== process.env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ error: 'Invalid admin password.' }, { status: 401 })
  }

  try {
    const { id } = (await request.json()) as { id?: number }

    if (typeof id !== 'number' || !Number.isInteger(id)) {
      return NextResponse.json({ error: 'A valid product is required.' }, { status: 400 })
    }

    await deleteProduct(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!isProductDatabaseConfigured() || !process.env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ error: 'Product administration is not configured.' }, { status: 503 })
  }

  if (request.headers.get('x-admin-password') !== process.env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ error: 'Invalid admin password.' }, { status: 401 })
  }

  try {
    const product = (await request.json()) as Partial<Product>
    const id = product.id
    const name = product.name?.trim()
    const category = product.category?.trim()
    const description = product.description?.trim()

    if (typeof id !== 'number' || !Number.isInteger(id) || !name || !category || !description) {
      return NextResponse.json(
        { error: 'Product ID, name, category, and description are required.' },
        { status: 400 },
      )
    }

    await updateProduct(id, {
      name,
      category,
      price: product.price?.trim() || 'Custom price',
      description,
      image: product.image?.trim() || '/placeholder.svg',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to update product.' }, { status: 500 })
  }
}