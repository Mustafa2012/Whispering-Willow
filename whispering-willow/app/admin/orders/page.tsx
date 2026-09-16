import type { Metadata } from 'next'
import { AdminOrdersPage } from '@/components/admin-orders-page'

export const metadata: Metadata = {
  title: 'Orders Dashboard — Whispering Willow',
  description: 'Review and manage Whispering Willow orders.',
}

export default function AdminOrdersRoute() {
  return <AdminOrdersPage />
}