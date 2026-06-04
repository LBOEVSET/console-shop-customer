import RetroGridBackground from "@/components/arcade/RetroGridBackground"
import NeonCursor from "@/components/arcade/NeonCursor"
import ArcadeTicker from "@/components/arcade/ArcadeTicker"
import ArcadeBanner from "@/components/arcade/ArcadeBanner"
import HeadlinesSection from "@/components/home/HeadlinesSection"
import ProductSection from "@/components/home/ProductSection"
import { serverFetch } from "@/lib/serverFetch"

export default async function HomePage() {
  const [articlesRes, productsRes] = await Promise.all([
    serverFetch("/articles"),
    serverFetch("/products"),
  ])

  const articles = articlesRes?.data?.data ?? articlesRes?.data ?? []
  const products = productsRes?.data?.data ?? productsRes?.data ?? []

  return (
    <main className="relative text-white pt-2">
      <RetroGridBackground />
      <NeonCursor />
      <ArcadeTicker />

      <ArcadeBanner />

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
