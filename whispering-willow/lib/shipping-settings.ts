export type ShippingSettings = {
  deliveryCharge: number
  freeShippingEnabled: boolean
  freeShippingThreshold: number
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  bankTransferEnabled: boolean
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  deliveryCharge: 250,
  freeShippingEnabled: true,
  freeShippingThreshold: 5000,
  bankName: 'Meezan Bank',
  bankAccountName: 'Whispering Willow',
  bankAccountNumber: '0000000000',
  bankTransferEnabled: true,
}

export function calculateShippingCharge(subtotal: number, settings: ShippingSettings) {
  if (settings.freeShippingEnabled && subtotal >= settings.freeShippingThreshold) {
    return 0
  }

  return settings.deliveryCharge
}
