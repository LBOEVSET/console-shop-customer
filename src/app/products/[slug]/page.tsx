import type { Metadata } from "next"
import { serverFetch } from "@/lib/serverFetch"
import ProductDetailClient from "./ProductDetailClient"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arcadezenter.com"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const res = await serverFetch(`/products/${slug}`)
  const product = res?.data ?? res

  if (!product) return { title: "Product Not Found" }

  const title = product.title
  const description = product.description?.slice(0, 160) ?? `Buy ${title} — instant digital delivery at ArcadeZenter.`
  const image = product.media?.find((m: any) => m.type === "IMAGE")?.url
  const url = `${SITE_URL}/products/${slug}`

  return {
    title,
    description,
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

export default function ProductDetailPage() {
  return <ProductDetailClient />
}
