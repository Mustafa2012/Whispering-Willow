import { NextResponse } from 'next/server'
import { getShippingSettings } from '@/lib/shipping-settings-server'

export async function GET() {
  try {
    return NextResponse.json(await getShippingSettings(), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load shipping settings.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
