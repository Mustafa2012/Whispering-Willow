const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function hasCustomerPlacedOrder(email?: string) {
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail || !supabaseUrl || !serviceRoleKey) return false

  const response = await fetch(`${supabaseUrl}/rest/v1/orders?select=id&email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    cache: 'no-store',
  })

  if (!response.ok) throw new Error('Unable to verify customer order history.')
  const orders = await response.json() as Array<{ id: number }>
  return orders.length > 0
}