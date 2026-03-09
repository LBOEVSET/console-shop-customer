import RetroGridBackground from "@/components/arcade/RetroGridBackground"
import NeonCursor from "@/components/arcade/NeonCursor"
import ArcadeTicker from "@/components/arcade/ArcadeTicker"
import InsertCoinButton from "@/components/arcade/InsertCoinButton"
import HeadlinesSection from "@/components/home/HeadlinesSection"
import ProductSection from "@/components/home/ProductSection"
import { serverFetch } from "@/lib/serverFetch"

export default async function HomePage() {
  const [articles, products] = await Promise.all([
    serverFetch("/articles"),
    serverFetch("/products"),
  ])

  return (
    <main className="relative text-white pt-12">
      <RetroGridBackground />
      <NeonCursor />
      <ArcadeTicker />

      <section className="py-16 flex justify-center">
        <InsertCoinButton />
      </section>

      <HeadlinesSection 
        articles={articles.slice(0, 3)}
        viewAllHref="/articles"
      />

      <ProductSection
        title="🔥 Hot Drops"
        products={products.slice(0, 4)}
        viewAllHref="/products"
      />
    </main>
  )
}