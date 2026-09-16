export const DELIVERY_CHARGE = 250
export const ORDER_DISCOUNT = 0

export function calculateOrderTotal(subtotal: number, discount = ORDER_DISCOUNT) {
  return Math.max(0, subtotal - discount + DELIVERY_CHARGE)
}