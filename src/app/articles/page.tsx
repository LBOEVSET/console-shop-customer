"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Article } from "@/types/article"
import ArticleCard from "@/components/article/ArticleCard"

export default function ArticlesPage() {
  const { data, isLoading, isError } = useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: async () => {
      const res = await api.get("/articles")
      return res.data
    }
  })

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load articles.
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No articles available.
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r 
                      from-fuchsia-400 via-purple-400 to-cyan-400
                      bg-clip-text text-transparent">
          📰 Articles
        </h1>

        <p className="text-gray-400">
          Stay informed with our latest news, reviews, and gaming insights.
        </p>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {data.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </main>
  )
}
