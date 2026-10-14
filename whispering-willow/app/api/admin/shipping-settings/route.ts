import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import {
  getShippingSettings,
  isShippingSettingsDatabaseConfigured,
  shippingSettingsDatabaseHeaders,
  shippingSettingsTableUrl,
} from '@/lib/shipping-settings-server'

async function unauthorized(request: Request) {
  return !(await isAdminRequest(request))
}

export async function GET(request: Request) {
  if (await unauthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  if (!isShippingSettingsDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Shipping settings database is not configured.' },
      { status: 503 },
    )
  }

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

export async function PATCH(request: Request) {
  if (await unauthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  if (!isShippingSettingsDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Shipping settings database is not configured.' },
      { status: 503 },
    )
  }

  let body: {
    deliveryCharge?: number
    freeShippingEnabled?: boolean
    freeShippingThreshold?: number
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid shipping settings.' }, { status: 400 })
  }

  if (
    typeof body.deliveryCharge !== 'number' ||
    !Number.isFinite(body.deliveryCharge) ||
    body.deliveryCharge < 0 ||
    typeof body.freeShippingEnabled !== 'boolean' ||
    typeof body.freeShippingThreshold !== 'number' ||
    !Number.isFinite(body.freeShippingThreshold) ||
    body.freeShippingThreshold < 0
  ) {
    return NextResponse.json(
      { error: 'Enter valid shipping charges and a free-shipping threshold.' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(
      `${shippingSettingsTableUrl()}?id=eq.true`,
      {
        method: 'PATCH',
        headers: {
          ...shippingSettingsDatabaseHeaders(),
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          delivery_charge: body.deliveryCharge,
          free_shipping_enabled: body.freeShippingEnabled,
          free_shipping_threshold: body.freeShippingThreshold,
          updated_at: new Date().toISOString(),
        }),
      },
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unable to save shipping settings. Ensure the latest Supabase migrations have been applied.' },
        { status: 500 },
      )
    }

    const updated = (await response.json()) as unknown[]
    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Shipping settings are missing from the store database.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      deliveryCharge: body.deliveryCharge,
      freeShippingEnabled: body.freeShippingEnabled,
      freeShippingThreshold: body.freeShippingThreshold,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to save shipping settings.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
