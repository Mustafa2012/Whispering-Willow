import { formatPrice } from '@/lib/products'
import { DELIVERY_CHARGE, ORDER_DISCOUNT } from '@/lib/order-pricing'

export type ReceiptOrder = {
  order_number: string
  subtotal?: number
  discount?: number
  discount_code?: string
  delivery_charge?: number
  total: number
  payment_method: string
  created_at: string
  address: string
  items: Array<{
    name: string
    price: number
    quantity: number
    selected_size?: string | null
  }>
}

export async function downloadOrderReceipt(order: ReceiptOrder) {
  const width = 900
  const lineHeight = 42
  const height = 610 + order.items.length * lineHeight
  const canvas = document.createElement('canvas')
  canvas.width = width * 2
  canvas.height = height * 2
  const context = canvas.getContext('2d')
  if (!context) return

  context.scale(2, 2)
  context.fillStyle = '#fbf8f2'
  context.fillRect(0, 0, width, height)
  const logo = new Image()
  logo.src = '/whispering-willow-logo.png'
  await new Promise<void>((resolve) => {
    logo.onload = () => resolve()
    logo.onerror = () => resolve()
  })
  if (logo.complete && logo.naturalWidth > 0) {
    context.drawImage(logo, 60, 35, 72, 72)
  }
  context.fillStyle = '#332d27'
  context.font = 'bold 34px Georgia, serif'
  context.fillText('Whispering Willow', 155, 70)
  context.font = '20px Arial, sans-serif'
  context.fillStyle = '#6f665d'
  context.fillText('Order receipt', 155, 105)
  context.textAlign = 'right'
  context.fillStyle = '#332d27'
  context.font = 'bold 22px Arial, sans-serif'
  context.fillText(order.order_number, width - 60, 70)
  context.font = '18px Arial, sans-serif'
  context.fillStyle = '#6f665d'
  context.fillText(new Date(order.created_at).toLocaleDateString(), width - 60, 105)
  context.textAlign = 'left'
  context.strokeStyle = '#d8d0c5'
  context.beginPath()
  context.moveTo(60, 135)
  context.lineTo(width - 60, 135)
  context.stroke()
  context.fillStyle = '#332d27'
  context.font = '18px Arial, sans-serif'
  context.fillText(`Payment: ${order.payment_method.replace('_', ' ')}`, 60, 180)
  context.fillText(`Delivery: ${order.address}`, 60, 215)
  if (order.discount_code) context.fillText(`Discount code: ${order.discount_code}`, 60, 250)
  const itemHeaderY = order.discount_code ? 295 : 280
  context.font = 'bold 18px Arial, sans-serif'
  context.fillStyle = '#332d27'
  context.fillText('Item', 60, itemHeaderY)
  context.fillText('Price', 570, itemHeaderY)
  context.fillText('Quantity', 740, itemHeaderY)
  let itemY = itemHeaderY + 40
  order.items.forEach((item) => {
    context.font = '18px Arial, sans-serif'
    context.fillStyle = '#6f665d'
    context.fillText(`${item.name}${item.selected_size ? ` (Size ${item.selected_size})` : ''}`, 60, itemY)
    context.fillText(formatPrice(item.price), 570, itemY)
    context.fillText(String(item.quantity), 740, itemY)
    context.fillStyle = '#332d27'
    context.strokeStyle = '#e6dfd6'
    context.beginPath()
    context.moveTo(60, itemY + 14)
    context.lineTo(width - 60, itemY + 14)
    context.stroke()
    itemY += lineHeight
  })
  context.textAlign = 'right'
  context.font = '18px Arial, sans-serif'
  context.fillStyle = '#6f665d'
  const discountAmount = order.discount ?? ORDER_DISCOUNT
  const deliveryCharge = order.delivery_charge ?? DELIVERY_CHARGE
  context.fillText(
    `Subtotal: ${formatPrice(order.subtotal ?? Math.max(0, order.total - deliveryCharge + discountAmount))}`,
    width - 60,
    itemY + 35,
  )
  context.fillText(
    `Discount: ${discountAmount === 0 ? formatPrice(0) : `-${formatPrice(discountAmount)}`}`,
    width - 60,
    itemY + 68,
  )
  context.fillText(
    `Delivery charges: ${deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}`,
    width - 60,
    itemY + 101,
  )
  context.font = 'bold 24px Arial, sans-serif'
  context.fillStyle = '#332d27'
  context.fillText(`Total: ${formatPrice(order.total)}`, width - 60, itemY + 145)

  const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!imageBlob) return
  const receiptUrl = URL.createObjectURL(imageBlob)
  const downloadLink = document.createElement('a')
  downloadLink.href = receiptUrl
  downloadLink.download = `receipt-${order.order_number}.png`
  document.body.appendChild(downloadLink)
  downloadLink.click()
  downloadLink.remove()
  URL.revokeObjectURL(receiptUrl)
}
