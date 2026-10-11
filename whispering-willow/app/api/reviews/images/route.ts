import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'

const allowedTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const maxFileSize = 5 * 1024 * 1024

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PANEL_PASSWORD
  const isAdmin = Boolean(adminPassword) && request.headers.get('x-admin-password') === adminPassword
  const customer = isAdmin ? null : await getCustomerSession(request)
  if (!isAdmin && !customer) return NextResponse.json({ error: 'Sign in to upload review images.' }, { status: 401 })

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'Review image uploads are not configured.' }, { status: 503 })
  if (Number(request.headers.get('content-length')) > 17 * 1024 * 1024) {
    return NextResponse.json({ error: 'The total upload must be 15 MB or smaller.' }, { status: 413 })
  }

  const files = (await request.formData()).getAll('files')
  if (!files.length || files.length > 3 || files.some((file) => !(file instanceof File))) {
    return NextResponse.json({ error: 'Choose between one and three images.' }, { status: 400 })
  }

  const invalidType = (files as File[]).some((file) => !allowedTypes[file.type])
  if (invalidType) return NextResponse.json({ error: 'Use JPEG, PNG, WebP, or GIF images.' }, { status: 400 })
  if ((files as File[]).some((file) => file.size > maxFileSize)) {
    return NextResponse.json({ error: 'Each image must be 5 MB or smaller.' }, { status: 400 })
  }

  const paths: string[] = []
  for (const file of files as File[]) {
    const extension = allowedTypes[file.type]
    const path = `${isAdmin ? 'admin' : customer!.id}/${randomUUID()}.${extension}`
    const encodedPath = path.split('/').map(encodeURIComponent).join('/')
    const response = await fetch(`${supabaseUrl}/storage/v1/object/review-images/${encodedPath}`, {
      method: 'POST',
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': file.type, 'x-upsert': 'false' },
      body: await file.arrayBuffer(),
    })
    if (!response.ok) return NextResponse.json({ error: 'Unable to upload a review image.' }, { status: 500 })
    paths.push(path)
  }

  return NextResponse.json({ imagePaths: paths }, { status: 201 })
}