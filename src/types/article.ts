export interface ArticleMedia {
  id: string
  articleId: string
  type: "IMAGE" | "VIDEO" | "EXTERNAL_VIDEO"
  url: string
  sortOrder: number
}

export interface Article {
  id: string
  type: "NEWS" | "ANNOUNCEMENT" | "PROMOTION"
  title: string
  slug: string
  summary: string
  content: string
  reference: string
  isPublished: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
  media?: ArticleMedia[]
}
