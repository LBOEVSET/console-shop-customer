"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function ArticleDetailPage() {
  const { slug } = useParams()

  const { data } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const res = await api.get(`/articles/${slug}`)
      return res.data
    },
    enabled: !!slug,
  })

  if (!data) return null

  return (
    <article className="relative max-w-5xl mx-auto py-20 px-6 text-white">

      <span className="px-4 py-1 text-xs tracking-wider uppercase
                       bg-zinc-900 border border-cyan-400/40
                       rounded-full text-cyan-300">
        {data.type}
      </span>

      <h1 className="text-6xl font-extrabold leading-tight mb-8
                     bg-gradient-to-r from-fuchsia-400 to-cyan-400
                     bg-clip-text text-transparent">
        {data.title}
      </h1>

      <div className="text-gray-400 mb-12">
        {new Date(data.publishedAt).toLocaleDateString()}
      </div>

      {data.media?.[0] && (
        <div className="relative h-[500px] w-full 
                        rounded-2xl overflow-hidden mb-16
                        border border-cyan-400/30
                        hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]
                        transition-all duration-500">
          <Image
            src={data.media[0].url}
            alt={data.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none
                      prose-headings:text-cyan-300
                      prose-strong:text-fuchsia-400
                      prose-a:text-indigo-400">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {data.content}
        </ReactMarkdown>
      </div>

      {data.reference && (
        <div className="mt-12">
          <a
            href={data.reference}
            target="_blank"
            className="text-indigo-400 hover:underline"
          >
            Source Reference →
          </a>
        </div>
      )}
    </article>
  )
}
