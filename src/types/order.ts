export interface OrderItem {
  productId: string
  quantity: number
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
  item: {
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
}
