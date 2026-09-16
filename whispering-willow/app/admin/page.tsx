import type { Metadata } from 'next'
import { AdminPage } from '@/components/admin-page'

export const metadata: Metadata = {
  title: 'Inventory — Whispering Willow',
  description: 'Manage the Whispering Willow product catalog.',
}

export default function AdminRoute() {
  return <AdminPage />
}
