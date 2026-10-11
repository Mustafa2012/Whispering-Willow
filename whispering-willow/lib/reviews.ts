export type StoreReview = {
  id: number
  reviewer_name: string
  rating: number
  review_text: string
  is_published: boolean
  created_at: string
  customer_id?: string | null
  image_paths?: string[]
  images?: string[]
  image_urls?: string[]
}
