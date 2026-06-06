import Link from "next/link"
import ArticleCard from "@/components/article/ArticleCard"
import { Article } from "@/types/article"

export default function HeadlinesSection(
  { articles, viewAllHref }: 
  {
    articles: Article[]
    viewAllHref?: string
  }
) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-[0.25em] text-fuchsia-400 uppercase">Latest</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            ⚡ News &amp; Promotions
          </h2>
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-cyan-400
            hover:text-fuchsia-400
            hover:tracking-wide
            transition-all duration-300 shrink-0"
          >
            View All →
          </Link>
        )}
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No articles yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article: Article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  )
}
