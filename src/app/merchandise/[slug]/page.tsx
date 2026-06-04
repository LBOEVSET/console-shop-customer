import type { Metadata } from "next"
import { serverFetch } from "@/lib/serverFetch"
import MerchandiseDetailClient from "./MerchandiseDetailClient"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arcadezenter.com"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const res = await serverFetch(`/merchandise/${slug}`)
  const item = res?.data ?? res

  if (!item) return { title: "Item Not Found" }

  const title = item.title
  const description = item.description?.slice(0, 160) ?? `Shop ${title} — official ArcadeZenter merchandise.`
  const image = item.media?.[0]?.url
  const url = `${SITE_URL}/merchandise/${slug}`
  const price = item.price ? `฿${Number(item.price).toLocaleString()}` : undefined

  return {
    title,
    description: price ? `${price} — ${description}` : description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default function MerchandiseDetailPage() {
  return <MerchandiseDetailClient />
}
