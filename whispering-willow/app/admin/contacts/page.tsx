import type { Metadata } from 'next'
import { AdminContactsPage } from '@/components/admin-contacts-page'

export const metadata: Metadata = {
  title: 'Contacts — Whispering Willow',
  description: 'View newsletter subscribers and customer contact details.',
}

export default function AdminContactsRoute() {
  return <AdminContactsPage />
}
