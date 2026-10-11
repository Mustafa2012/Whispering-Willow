import { Star } from 'lucide-react'
import type { StoreReview } from '@/lib/reviews'

type StoreReviewsProps = {
  reviews: StoreReview[]
}

export function StoreReviews({ reviews }: StoreReviewsProps) {
  return (
    <section aria-labelledby="store-reviews-heading" className="border-y border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">From our customers</p>
            <h2 id="store-reviews-heading" className="mt-2 font-serif text-3xl text-foreground md:text-4xl">Kind words</h2>
          </div>
          {reviews.length ? <span className="text-sm text-muted-foreground">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span> : null}
        </div>
        {reviews.length ? (
          <div className="grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.id} className="border-l border-primary/60 pl-5">
                <div className="flex gap-1 text-primary" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} aria-hidden="true" className={`h-4 w-4 ${index < review.rating ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">&ldquo;{review.review_text}&rdquo;</p>
                {review.images?.length ? <div className="mt-4 flex flex-wrap gap-2">{review.images.map((image) => <img key={image} src={image} alt={`Photo shared by ${review.reviewer_name}`} className="h-20 w-20 border border-border object-cover sm:h-24 sm:w-24" />)}</div> : null}
                <p className="mt-4 text-sm font-medium text-foreground">{review.reviewer_name}</p>
              </article>
            ))}
          </div>
        ) : <p className="border-y border-border/70 py-6 text-sm text-muted-foreground">No customer reviews yet.</p>}

      </div>
    </section>
  )
}