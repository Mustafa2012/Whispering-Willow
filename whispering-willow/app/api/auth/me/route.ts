import { NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'

export async function GET(request: Request) {
  const user = await getCustomerSession(request)
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  return NextResponse.json(user ? { authenticated: true, email: user.email, avatarUrl } : { authenticated: false })
}