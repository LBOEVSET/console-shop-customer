import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gaming News & Articles",
  description: "Stay up to date with the latest gaming news, announcements, reviews and promotions from ArcadeZenter.",
  alternates: { canonical: "https://arcadezenter.com/articles" },
  openGraph: {
    title: "Gaming News & Articles | ArcadeZenter",
    description: "Stay up to date with the latest gaming news, announcements, reviews and promotions.",
    url: "https://arcadezenter.com/articles",
    type: "website",
  },
}

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
