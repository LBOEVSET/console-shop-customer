import { ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  className?: string
}

export default function Pagination({ page, totalPages, onPageChange, className = "" }: Props) {
  if (totalPages <= 1) return null

  const pages: (number | "...")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("...")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push("...")
    pages.push(totalPages)
  }

  return (
    <div className={`flex items-center justify-between pt-4 ${className}`}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-white/10
          text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5
          disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={15} /> Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-600 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition
                ${page === p
                  ? "bg-fuchsia-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-white/10
          text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5
          disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        Next <ChevronRight size={15} />
      </button>
    </div>
  )
}
