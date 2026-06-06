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
                 rounded-3xl overflow-hidden
                 border border-white/10
                 hover:border-fuchsia-500/50
                 shadow-lg hover:shadow-fuchsia-900/30
                 transition-all duration-500"
    >
      {/* Background Image */}
      <Image
        src={image}
        alt={article.title}
        fill
        className="object-cover group-hover:scale-105
                   transition duration-700"
      />

      {/* Dark fallback + gradient overlay */}
      <div className="absolute inset-0 bg-zinc-900" style={{ zIndex: -1 }} />
      <div className="absolute inset-0
                      bg-gradient-to-t
                      from-black/90 via-black/50 to-black/10" />

      {/* Top glow accent on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute bottom-7 left-7 right-7 space-y-2">
        <p className="text-[11px] text-fuchsia-400 font-bold uppercase tracking-widest">
          {article.type}
        </p>

        <h3 className="text-xl lg:text-2xl font-extrabold text-white leading-snug drop-shadow-lg group-hover:text-fuchsia-100 transition-colors duration-300">
          {article.title}
        </h3>

        <p className="text-sm text-gray-300/80 line-clamp-2">
          {article.summary}
        </p>

        <p className="text-xs text-cyan-400/70 font-semibold pt-1 group-hover:text-cyan-300 transition-colors">
          Read more →
        </p>
      </div>
    </Link>
  )
}
