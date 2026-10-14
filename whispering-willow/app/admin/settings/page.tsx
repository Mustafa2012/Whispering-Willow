import type { Metadata } from 'next'
import { AdminSettingsPage } from '@/components/admin-settings-page'

export const metadata: Metadata = {
  title: 'Store Settings — Whispering Willow Admin',
  description: 'Manage payment, shipping, discount, and admin access settings.',
}

export default function AdminSettingsRoute() {
  return <AdminSettingsPage />
}
