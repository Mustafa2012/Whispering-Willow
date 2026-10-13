export const DELIVERY_CHARGE = 250
export const ORDER_DISCOUNT = 0

export function calculateOrderTotal(
  subtotal: number,
  discount = ORDER_DISCOUNT,
  deliveryCharge = DELIVERY_CHARGE,
) {
  return Math.max(0, subtotal - discount + deliveryCharge)
}