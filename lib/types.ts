export type Hotel = {
  id: string
  slug: string
  name: string
  area: string
  prefecture: string
  city: string
  coin: number
  rating: number
  review_count: number
  image_url: string | null
  amenities: string[]
  description: string | null
  featured: boolean
  is_active: boolean
  address: string | null
}

export type Reservation = {
  id: string
  hotel_id: string
  check_in: string
  check_out: string
  guests: number
  coin_amount: number
  total_nights: number
  status: string
  confirmation_code: string | null
  created_at: string
  hotels?: Pick<Hotel,'name'|'slug'|'image_url'|'area'> | null
}

export type Profile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  coin_balance: number
  is_admin: boolean
}
