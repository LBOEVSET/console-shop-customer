"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useState } from "react"
import { Article } from "@/types/article"
import ArticleCard from "@/components/article/ArticleCard"
import Pagination from "@/components/ui/Pagination"

const PAGE_SIZE = 12

export default function ArticlesPage() {
  const [page, setPage] = useState(1)

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["articles", page],
    queryFn: async () => {
      const q = new URLSearchParams()
      q.set("page", String(page))
      q.set("limit", String(PAGE_SIZE))
      const r = await api.get(`/articles?${q}`)
      return r.data?.data ?? r.data
    },
    placeholderData: (prev: any) => prev,
  })

  const articles: Article[] = res?.data ?? []
  const totalPages: number = res?.totalPages ?? 1

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })
  const handlePage = (p: number) => { setPage(p); scrollToTop() }

  return (
    <main className="max-w-7xl mx-auto px-6 py-20 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          📰 Articles
        </h1>
        <p className="text-gray-400">Stay informed with our latest news, reviews, and gaming insights.</p>
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />)}
        </div>
      )}

      {isError && <div className="text-center py-20 text-red-500">Failed to load articles.</div>}

      {!isLoading && !isError && articles.length === 0 && (
        <div className="text-center py-20 text-gray-500">No articles available.</div>
      )}

      {!isLoading && !isError && articles.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {articles.map(article => <ArticleCard key={article.id} article={article} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePage} />
        </>
      )}
    </main>
  )
}
