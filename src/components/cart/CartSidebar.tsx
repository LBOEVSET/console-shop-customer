"use client"

import { useCartStore } from "@/store/cart.store"
import Image from "next/image"
import Link from "next/link"

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    totalPrice,
  } = useCartStore()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 bg-black/60 z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-black 
        border-l border-cyan-400 z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 flex flex-col h-full">

          <h2 className="text-2xl font-bold text-cyan-400 mb-6">
            🛒 Your Cart
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4">
            {items.length === 0 && (
              <p className="text-gray-400">Your cart is empty.</p>
            )}

            {items.map((item) => {
              const image =
                item.product.media?.[0]?.url || "/placeholder.png"

              return (
                <div
                  key={item.productId}
                  className="flex gap-4 bg-zinc-900 p-3 rounded-xl"
                >
                  <div className="relative w-16 h-16">
                    <Image
                      src={image}
                      alt={item.product.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {item.product.title}
                    </p>

                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity}
                    </p>

                    <p className="text-cyan-400 font-bold">
                      ${Number(item.product.price).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-cyan-400 pt-4 space-y-4">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${totalPrice().toFixed(2)}</span>
            </div>

            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full bg-cyan-500 hover:bg-cyan-600 
                         text-black text-center py-3 rounded-xl font-bold transition"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
