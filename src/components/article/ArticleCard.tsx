"use client"

import Link from "next/link"
import Image from "next/image"
import { Article } from "@/types/article"

export default function ArticleCard({
  article,
}: {
  article: Article
}) {
  const image =
    article.media?.find((m) => m.type === "IMAGE")?.url ||
    "/placeholder.png"

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group relative block w-full h-80 
                 rounded-3xl overflow-hidden"
    >
      {/* Background Image */}
      <Image
        src={image}
        alt={article.title}
        fill
        className="object-cover group-hover:scale-105 
                   transition duration-700"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 
                      bg-gradient-to-t 
                      from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-8 left-8 right-8 space-y-3">

        <p className="text-xs text-fuchsia-400 font-bold uppercase tracking-wider">
          {article.type}
        </p>

        <h3 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight drop-shadow-lg">
          {article.title}
        </h3>

        <p className="text-sm text-gray-300 line-clamp-2 max-w-xl">
          {article.summary}
        </p>
      </div>
    </Link>
  )
}
