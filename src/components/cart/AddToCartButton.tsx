"use client"

import { useCartStore } from "@/store/cart.store"
import { flyToCart } from "@/lib/flyToCart"
import { RefObject } from "react"

interface Props {
  productId: string
  stock: number
  imageRef?: React.RefObject<HTMLDivElement | null>
}

export default function AddToCartButton({
  productId,
  stock,
  imageRef,
}: Props) {
  const addToCart = useCartStore(state => state.addToCart)

  const handleAdd = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const cartElement = document.getElementById("cart-icon")

    if (imageRef?.current && cartElement) {
      const img =
        imageRef.current.querySelector("img") as HTMLImageElement | null

      if (img) {
        flyToCart(img, cartElement)
      }
    }

    await addToCart(productId, 1)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={stock === 0}
      className="w-full mt-4 py-2 rounded-xl font-semibold
                 bg-gradient-to-r from-fuchsia-500 to-purple-600
                 hover:scale-105 transition-all duration-300
                 disabled:opacity-50"
    >
      Add to Cart
    </button>
  )
}
