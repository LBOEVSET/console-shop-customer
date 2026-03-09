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
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-black mb-10 text-cyan-400">
          ⚡ News & Promotions
        </h2>
        
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-cyan-400 
            hover:text-fuchsia-400 
            hover:tracking-wide
            transition-all duration-300"
          >
            View All →
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {articles.map((article: Article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}