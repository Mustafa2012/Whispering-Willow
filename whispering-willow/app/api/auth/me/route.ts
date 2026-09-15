import { NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'

export async function GET() {
  const user = await getCustomerSession()
  return NextResponse.json(user ? { authenticated: true, email: user.email } : { authenticated: false })
}