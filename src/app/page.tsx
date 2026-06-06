import RetroGridBackground from "@/components/arcade/RetroGridBackground"
import NeonCursor from "@/components/arcade/NeonCursor"
import ArcadeTicker from "@/components/arcade/ArcadeTicker"
import ArcadeBanner from "@/components/arcade/ArcadeBanner"
import HeadlinesSection from "@/components/home/HeadlinesSection"
import ProductSection from "@/components/home/ProductSection"
import EventsHomeSection from "@/components/home/EventsHomeSection"
import MerchandiseHomeSection from "@/components/home/MerchandiseHomeSection"
import { serverFetch } from "@/lib/serverFetch"

export default async function HomePage() {
  const [articlesRes, productsRes, eventsRes, merchRes] = await Promise.all([
    serverFetch("/articles"),
    serverFetch("/products"),
    serverFetch("/events?limit=6&page=1"),
    serverFetch("/merchandise?limit=4&page=1"),
  ])

  const articles = articlesRes?.data?.data ?? articlesRes?.data ?? []
  const products = productsRes?.data?.data ?? productsRes?.data ?? []
  const allEvents = eventsRes?.data?.data ?? eventsRes?.data ?? []
  const allMerch  = merchRes?.data?.data  ?? merchRes?.data  ?? []

  // Show only upcoming active events
  const now = new Date()
  const upcomingEvents = allEvents
    .filter((e: any) => new Date(e.date) >= now && e.isActive)
    .slice(0, 3)

  // Show only active merch
  const merch = allMerch
    .filter((m: any) => m.isActive)
    .slice(0, 4)

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

      <EventsHomeSection events={upcomingEvents} />

      <ProductSection
        title="🔥 Hot Drops"
        products={products.slice(0, 4)}
        viewAllHref="/products"
      />

      <MerchandiseHomeSection items={merch} />
    </main>
  )
}
