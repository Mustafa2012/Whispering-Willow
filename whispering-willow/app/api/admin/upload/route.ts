import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { isAdminRequest } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Image storage is not configured.' }, { status: 503 })
  }

  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Invalid admin password.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Please upload an image file.' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Images must be smaller than 5 MB.' }, { status: 400 })
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${randomUUID()}.${extension}`
  const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/product-images/${fileName}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: await file.arrayBuffer(),
  })

  if (!uploadResponse.ok) {
    return NextResponse.json({ error: 'Unable to upload image.' }, { status: 500 })
  }

  return NextResponse.json({ url: `${supabaseUrl}/storage/v1/object/public/product-images/${fileName}` })
}
