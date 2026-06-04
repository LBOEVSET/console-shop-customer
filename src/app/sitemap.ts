import type { MetadataRoute } from "next"
import { serverFetch } from "@/lib/serverFetch"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arcadezenter.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/merchandise`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ]

  // Dynamic product routes
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const res = await serverFetch("/products?limit=200&page=1")
    const products: any[] = res?.data?.data ?? res?.data ?? []
    productRoutes = products.map((p: any) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt ?? now),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch { /* silently skip if API unavailable at build time */ }

  // Dynamic article routes
  let articleRoutes: MetadataRoute.Sitemap = []
  try {
    const res = await serverFetch("/articles?limit=100&page=1")
    const articles: any[] = res?.data?.data ?? res?.data ?? []
    articleRoutes = articles
      .filter((a: any) => a.isPublished)
      .map((a: any) => ({
        url: `${SITE_URL}/articles/${a.slug}`,
        lastModified: new Date(a.publishedAt ?? a.updatedAt ?? now),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
  } catch { /* skip */ }

  // Dynamic event routes
  let eventRoutes: MetadataRoute.Sitemap = []
  try {
    const res = await serverFetch("/events?limit=100&page=1")
    const events: any[] = res?.data?.data ?? res?.data ?? []
    eventRoutes = events.map((e: any) => ({
      url: `${SITE_URL}/events/${e.slug}`,
      lastModified: new Date(e.updatedAt ?? now),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }))
  } catch { /* skip */ }

  // Dynamic merchandise routes
  let merchRoutes: MetadataRoute.Sitemap = []
  try {
    const res = await serverFetch("/merchandise?limit=100&page=1")
    const items: any[] = res?.data?.data ?? res?.data ?? []
    merchRoutes = items.map((m: any) => ({
      url: `${SITE_URL}/merchandise/${m.slug}`,
      lastModified: new Date(m.updatedAt ?? now),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  } catch { /* skip */ }

  return [...staticRoutes, ...productRoutes, ...articleRoutes, ...eventRoutes, ...merchRoutes]
}
