export type ShippingSettings = {
  deliveryCharge: number
  freeShippingEnabled: boolean
  freeShippingThreshold: number
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  deliveryCharge: 250,
  freeShippingEnabled: true,
  freeShippingThreshold: 5000,
}

export function calculateShippingCharge(subtotal: number, settings: ShippingSettings) {
  if (settings.freeShippingEnabled && subtotal >= settings.freeShippingThreshold) {
    return 0
  }

  return settings.deliveryCharge
}
