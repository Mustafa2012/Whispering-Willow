import type { Metadata } from 'next'
import { AdminReviewsPage } from '@/components/admin-reviews-page'

export const metadata: Metadata = {
  title: 'Store Reviews — Whispering Willow Admin',
  description: 'Review and publish customer testimonials for Whispering Willow.',
}

export default function AdminReviewsRoute() {
  return <AdminReviewsPage />
}