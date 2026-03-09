import Image from "next/image"
import Link from "next/link"

export default function ArcadeProductCard({ product }: { product: any }) {
  const image = product.media?.[0]?.url || "/placeholder.png"

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative bg-[#1b1b3a] rounded-2xl overflow-hidden border-2 border-cyan-400 hover:border-fuchsia-500 transition shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,0,255,0.6)]"
    >
      <div className="relative h-60">
        <Image
          src={image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition"
        />
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg line-clamp-2">
          {product.title}
        </h3>

        <p className="text-cyan-300 font-bold text-xl">
          ฿{Number(product.price).toLocaleString()}
        </p>

        {product.discount && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-black 
                            px-3 py-1 text-xs font-bold 
                            shadow-[3px_3px_0px_#ff00ff]
                            border-2 border-black">
                -{product.discount}%
            </div>
        )}

        <button className="w-full py-2 bg-fuchsia-500 hover:bg-yellow-400 hover:text-black font-bold rounded-xl transition">
          ADD TO CART
        </button>
      </div>
    </Link>
  )
}
