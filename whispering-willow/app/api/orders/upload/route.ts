import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return NextResponse.json({ error: 'File uploads are not configured.' }, { status: 503 })
  const file = (await request.formData()).get('file')
  if (!(file instanceof File) || !file.type.startsWith('image/')) return NextResponse.json({ error: 'Please upload an image file.' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Images must be smaller than 5 MB.' }, { status: 400 })
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${randomUUID()}.${extension}`
  const response = await fetch(`${supabaseUrl}/storage/v1/object/order-proofs/${fileName}`, { method: 'POST', headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': file.type }, body: await file.arrayBuffer() })
  if (!response.ok) return NextResponse.json({ error: 'Unable to upload proof.' }, { status: 500 })
  return NextResponse.json({ url: `${supabaseUrl}/storage/v1/object/public/order-proofs/${fileName}` })
}