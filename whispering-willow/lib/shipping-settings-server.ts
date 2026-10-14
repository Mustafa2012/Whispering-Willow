import {
  DEFAULT_SHIPPING_SETTINGS,
  type ShippingSettings,
} from '@/lib/shipping-settings'

const supabaseUrl = process.env.SUPABASE_URL
  ?.replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function isShippingSettingsDatabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey)
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  if (!isShippingSettingsDatabaseConfigured()) {
    return DEFAULT_SHIPPING_SETTINGS
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/store_settings?select=delivery_charge,free_shipping_enabled,free_shipping_threshold,bank_name,bank_account_name,bank_account_number,bank_transfer_enabled&id=eq.true&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey!,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(
      'Unable to load shipping settings. Ensure the latest Supabase migrations have been applied.',
    )
  }

  const [row] = (await response.json()) as Array<{
    delivery_charge: number | string
    free_shipping_enabled: boolean
    free_shipping_threshold: number | string
    bank_name: string
    bank_account_name: string
    bank_account_number: string
    bank_transfer_enabled: boolean
  }>

  if (!row) {
    throw new Error('Shipping settings are missing from the store database.')
  }

  const deliveryCharge = Number(row.delivery_charge)
  const freeShippingThreshold = Number(row.free_shipping_threshold)
  if (
    !Number.isFinite(deliveryCharge) ||
    deliveryCharge < 0 ||
    typeof row.free_shipping_enabled !== 'boolean' ||
    !Number.isFinite(freeShippingThreshold) ||
    freeShippingThreshold < 0
  ) {
    throw new Error('Shipping settings in the store database are invalid.')
  }

  return {
    deliveryCharge,
    freeShippingEnabled: row.free_shipping_enabled,
    freeShippingThreshold,
    bankName: row.bank_name,
    bankAccountName: row.bank_account_name,
    bankAccountNumber: row.bank_account_number,
    bankTransferEnabled: row.bank_transfer_enabled,
  }
}

export function shippingSettingsDatabaseHeaders() {
  if (!isShippingSettingsDatabaseConfigured()) {
    throw new Error('Shipping settings database is not configured.')
  }

  return {
    apikey: serviceRoleKey!,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }
}

export function shippingSettingsTableUrl() {
  if (!supabaseUrl) {
    throw new Error('Shipping settings database is not configured.')
  }

  return `${supabaseUrl}/rest/v1/store_settings`
}

export { DEFAULT_SHIPPING_SETTINGS }
