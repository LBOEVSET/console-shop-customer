import { Product } from "@/types/product"

export function getProductPrice(product: Product, region: string) {
  const price = product.prices?.find(p => p.region === region)

  if (!price) return null

  const hasDiscount =
    price.salePrice !== undefined &&
    price.salePrice !== null &&
    price.salePrice > 0

  const finalPrice = hasDiscount
    ? price.salePrice!
    : price.price

  const discountPercent = hasDiscount
    ? Math.round(((price.price - price.salePrice!) / price.price) * 100)
    : 0

  return {
    price: price.price,
    salePrice: price.salePrice ?? 0,
    finalPrice,              // ✅ ALWAYS number
    hasDiscount,
    discountPercent,
  }
}