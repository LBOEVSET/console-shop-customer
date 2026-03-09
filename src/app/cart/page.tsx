"use client"

import { useEffect } from "react"
import { useCartStore } from "@/store/cart.store"
import Image from "next/image"
import Link from "next/link"

export default function CartPage() {
  const {
    items,
    fetchCart,
    removeFromCart,
    updateCart,
    totalPrice,
  } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  if (!items || items.length === 0) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link
          href="/products"
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 grid lg:grid-cols-3 gap-10">

      {/* LEFT - Cart Items */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>

        {items.map((item) => {
          const image =
            item.product.media?.find(m => m.type === "IMAGE")?.url ||
            "/placeholder.png"

          const price = Number(item.product.price)
          const subtotal = price * item.quantity

          return (
            <div
              key={item.productId}
              className="flex gap-6 p-6 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm"
            >
              {/* Image */}
              <div className="relative w-28 h-28 rounded-xl overflow-hidden">
                <Image
                  src={image}
                  alt={item.product.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">

                <div>
                  <h2 className="text-lg font-semibold">
                    {item.product.title}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    ${price.toFixed(2)}
                  </p>
                </div>

                {/* QUANTITY CONTROLS */}
                <div className="flex items-center gap-4 mt-4">

                  <button
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateCart(item.productId, item.quantity - 1)
                      }
                    }}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg font-bold disabled:opacity-40"
                  >
                    -
                  </button>

                  <span className="w-6 text-center font-medium">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateCart(item.productId, item.quantity + 1)
                    }
                    className="w-8 h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg font-bold"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 text-sm hover:underline ml-4"
                  >
                    Remove
                  </button>

                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right font-semibold text-lg">
                ${subtotal.toFixed(2)}
              </div>
            </div>
          )
        })}
      </div>

      {/* RIGHT - Order Summary */}
      <div className="sticky top-24 h-fit p-6 rounded-2xl border bg-white dark:bg-zinc-900 shadow-lg space-y-6">
        <h2 className="text-xl font-bold">Order Summary</h2>

        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${totalPrice().toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>

        <div className="border-t pt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${totalPrice().toFixed(2)}</span>
        </div>

        <Link
          href="/checkout"
          className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  )
}
