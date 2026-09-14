export type Product = {
  id?: number
  name: string
  category: string
  price: number
  description: string
  image: string
  isActive?: boolean
}

export const products: Product[] = [
  {
    name: 'Gem Bracelet',
    category: 'Bracelets',
    price: 9500,
    description: 'A luminous statement bracelet with faceted gemstone detail and a graceful gold finish.',
    image: '/images/Gem Bracelet.jpg',
  },
  {
    name: 'Tropical Bracelet',
    category: 'Bracelets',
    price: 8800,
    description: 'Vivid tropical inspired detailing that brings warmth, movement, and color to everyday styling.',
    image: '/images/tropical bracelet.jpg',
  },
  {
    name: 'Clam Bracelet',
    category: 'Bracelets',
    price: 8200,
    description: 'A sculptural shell-inspired bracelet with a clean, polished finish and a soft beachy glow.',
    image: '/images/Clam bracelet.jpg',
  },
  {
    name: 'Diamond Bracelet',
    category: 'Bracelets',
    price: 9800,
    description: 'Radiant diamond-inspired sparkle meets a refined silhouette for elevated everyday wear.',
    image: '/images/Diamond bracelet.jpg',
  },
  {
    name: 'Tiny Gemstone Bracelet',
    category: 'Bracelets',
    price: 7900,
    description: 'A delicate stack of tiny gemstone details designed for subtle shimmer and effortless charm.',
    image: '/images/Tiny gemstone bracelet.jpg',
  },
  {
    name: 'Opal Stone Ring',
    category: 'Rings',
    price: 10200,
    description: 'A soft opal-inspired ring with a delicate silhouette and shimmering iridescent glow.',
    image: '/images/Opal stone ring.jpg',
  },
  {
    name: 'Sun Halo Crystal Ring',
    category: 'Rings',
    price: 11000,
    description: 'Radiant crystal accents and warm metallic tones shaped into a celestial halo ring.',
    image: '/images/Sun Halo crystal ring.jpg',
  },
  {
    name: 'Sun Halo Lagoon Ring',
    category: 'Rings',
    price: 10800,
    description: 'A lagoon-inspired ring with layered shine and an airy, beachy elegance.',
    image: '/images/Sun Halo lagoon ring.jpg',
  },
  {
    name: 'North Star Ring',
    category: 'Rings',
    price: 9900,
    description: 'A minimalist celestial ring designed to feel both elevated and quietly bold.',
    image: '/images/North star ring.jpg',
  },
  {
    name: 'Pantheress Ring',
    category: 'Rings',
    price: 12400,
    description: 'Statement-making form with a sleek profile and rich jewel-toned energy.',
    image: '/images/Pantheress ring.jpg',
  },
  {
    name: 'Nautilus Ring',
    category: 'Rings',
    price: 11600,
    description: 'A sculptural shell-inspired ring with graceful curves and refined texture.',
    image: '/images/Nautilus ring.jpg',
  },
  {
    name: 'The Coral Reef Ring',
    category: 'Rings',
    price: 12800,
    description: 'A coral-inspired statement ring with layered sparkle and natural ocean character.',
    image: '/images/The coral reef ring.jpg',
  },
  {
    name: 'Star and Shell Ring',
    category: 'Rings',
    price: 10600,
    description: 'A beach-loved silhouette blending star detail and shell-inspired curves.',
    image: '/images/Star and shell ring.jpg',
  },
  {
    name: 'Heart Earring',
    category: 'Earrings',
    price: 7600,
    description: 'A sweet, sculptural heart earring with polished shine and romantic movement.',
    image: '/images/heart earing.jpg',
  },
  {
    name: 'Pearl Wine Earring',
    category: 'Earrings',
    price: 8300,
    description: 'Soft pearl tones and wine-inspired warmth elevate this elegant everyday pair.',
    image: '/images/pearl wine earing.jpg',
  },
]

export const collections = [
  { name: 'Bracelets', image: '/images/Gem Bracelet.jpg' },
  { name: 'Rings', image: '/images/Opal stone ring.jpg' },
  { name: 'Earrings', image: '/images/heart earing.jpg' },
]

export const INSTAGRAM_HANDLE = 'whisperingwillow.pk'
export const INSTAGRAM_URL = 'https://instagram.com/whisperingwillow.pk'

export function formatPrice(price: number) {
  return `PKR ${price.toLocaleString('en-PK')}`
}
