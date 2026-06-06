import { Product } from "@/types/product"

const THB_PER_USD = 35

/**
 * Returns price data for a given region.
 * Falls back to the "US" price and converts to THB when no regional price exists.
 */
export function getProductPrice(product: Product, region: string) {
  // Try exact region match first
  let price = product.prices?.find(p => p.region === region)
  let converted = false

  // Fall back to US price with conversion
  if (!price) {
    const usPrice = product.prices?.find(p => p.region === "US")
    if (usPrice) {
      if (region === "TH") {
        // Convert USD → THB
        price = {
          ...usPrice,
          region: "TH",
          currency: "THB",
          price: usPrice.price * THB_PER_USD,
          salePrice: usPrice.salePrice != null ? usPrice.salePrice * THB_PER_USD : undefined,
        }
        converted = true
      } else {
        price = usPrice
      }
    }
  }

  if (!price) return null

  const hasDiscount =
    price.salePrice !== undefined &&
    price.salePrice !== null &&
    price.salePrice > 0

  const finalPrice = hasDiscount ? price.salePrice! : price.price

  const discountPercent = hasDiscount
    ? Math.round(((price.price - price.salePrice!) / price.price) * 100)
    : 0

  return {
    price: price.price,
    salePrice: price.salePrice ?? 0,
    finalPrice,
    hasDiscount,
    discountPercent,
    converted,
  }
}
