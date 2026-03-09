// components/home/ProductGridSection.tsx

import ArcadeProductCard from "./ArcadeProductCard"
import SectionHeader from "./SectionHeader"

export default function ProductGridSection({
  title,
  products,
}: {
  title: string
  products: any[]
}) {
  if (!products?.length) return null

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto space-y-10">

      <SectionHeader title={title} />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ArcadeProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
