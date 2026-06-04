import type { Metadata } from "next"
import { serverFetch } from "@/lib/serverFetch"
import ArticleDetailClient from "./ArticleDetailClient"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arcadezenter.com"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const res = await serverFetch(`/articles/${slug}`)
  const article = res?.data ?? res

  if (!article) return { title: "Article Not Found" }

  const title = article.title
  const description = article.summary?.slice(0, 160) ?? `Read ${title} on ArcadeZenter.`
  const image = article.media?.[0]?.url
  const url = `${SITE_URL}/articles/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: article.publishedAt,
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

export default function ArticleDetailPage() {
  return <ArticleDetailClient />
}
