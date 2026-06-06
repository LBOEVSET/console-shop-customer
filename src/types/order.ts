export interface OrderItem {
  id?: string
  title: string
  quantity: number
  price: number
  productId?: string | null
  eventId?: string | null
  product?: {
    title: string
    media: { type: string; url: string }[]
  } | null
}

export interface Order {
  id: string
  status: string
  total: number
  subtotal: number
  discount: number
  createdAt: string
  paymentMethod: string
  payment?: { status: string }
  // list endpoint returns item (first item only); detail endpoint returns items array
  item?: OrderItem | null
  items?: OrderItem[]
}
