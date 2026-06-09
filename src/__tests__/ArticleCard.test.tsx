import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ArticleCard from '@/components/article/ArticleCard'
import type { Article } from '@/types/article'

const baseArticle: Article = {
  id: 'a1',
  type: 'NEWS',
  title: 'Big Gaming News',
  slug: 'big-gaming-news',
  summary: 'Something happened in gaming.',
  content: 'Full content here.',
  reference: '',
  isPublished: true,
  publishedAt: '2024-01-01',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  media: [{ id: 'm1', articleId: 'a1', type: 'IMAGE', url: '/news.jpg', sortOrder: 0 }],
}

describe('ArticleCard', () => {
  it('renders article title', () => {
    render(<ArticleCard article={baseArticle} />)
    expect(screen.getByText('Big Gaming News')).toBeInTheDocument()
  })

  it('renders article summary', () => {
    render(<ArticleCard article={baseArticle} />)
    expect(screen.getByText('Something happened in gaming.')).toBeInTheDocument()
  })

  it('renders article type label', () => {
    render(<ArticleCard article={baseArticle} />)
    expect(screen.getByText('NEWS')).toBeInTheDocument()
  })

  it('links to the article detail page', () => {
    render(<ArticleCard article={baseArticle} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/articles/big-gaming-news')
  })

  it('uses the article image url', () => {
    render(<ArticleCard article={baseArticle} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('/news.jpg')
  })

  it('uses placeholder image when no media', () => {
    render(<ArticleCard article={{ ...baseArticle, media: [] }} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('/placeholder.png')
  })

  it('uses placeholder when media has no IMAGE type', () => {
    const article = {
      ...baseArticle,
      media: [{ id: 'm2', articleId: 'a1', type: 'VIDEO' as const, url: '/video.mp4', sortOrder: 0 }],
    }
    render(<ArticleCard article={article} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('/placeholder.png')
  })

  it('renders Read more text', () => {
    render(<ArticleCard article={baseArticle} />)
    expect(screen.getByText(/read more/i)).toBeInTheDocument()
  })
})
