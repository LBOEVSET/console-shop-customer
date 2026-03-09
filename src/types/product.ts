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

export interface Product {
  id: string
  title: string
  slug: string
  description: string
  price: string
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  platformId: string
  categoryId: string
  platform: Platform
  categories: Category[]
  media: ProductMedia[]
}
