export interface OrderItem {
  productId: string
  quantity: number
}

export interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  item:{
    product: {
      title: string
      media: [
        {
          type: string
          url: string
        }
      ]
    }
  }
}
