export interface ProductMedia {
  id: string
  productId: string
  type: "IMAGE" | "VIDEO" | "EXTERNAL_VIDEO"
  url: string
  sortOrder: number
}

export interface Platform {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
}

export interface ProductPrice {
  region: string
  currency: string
  price: number
  salePrice?: number
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  platformId: string
  categoryId: string
  platform: Platform
  prices: ProductPrice[]
  categories: Category[]
  media: ProductMedia[]
}
