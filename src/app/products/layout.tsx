import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Game Library",
  description: "Browse our full catalogue of digital game keys for PlayStation, PC, Xbox and Nintendo. Filter by platform, genre and price.",
  alternates: { canonical: "https://arcadezenter.com/products" },
  openGraph: {
    title: "Game Library | ArcadeZenter",
    description: "Browse our full catalogue of digital game keys for PlayStation, PC, Xbox and Nintendo.",
    url: "https://arcadezenter.com/products",
    type: "website",
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
