import { NextResponse } from 'next/server'
import { customerSessionCookie } from '@/lib/customer-auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(customerSessionCookie, '', { httpOnly: true, maxAge: 0, path: '/' })
  return response
}