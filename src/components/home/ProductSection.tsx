import ProductCard from "@/components/product/ProductCard"
import { Product } from "@/types/product"
import Link from "next/link"

export default function ProductSection({
  title,
  products,
  viewAllHref,
}: {
  title: string
  products: Product[]
  viewAllHref?: string
}) {
  return (
    <section className="max-w-7xl mx-auto py-16 px-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
          {title}
        </h2>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-cyan-400 
            hover:text-fuchsia-400 
            hover:tracking-wide
            transition-all duration-300"
          >
            View All →
          </Link>
        )}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
