import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gaming Events & Tickets",
  description: "Find gaming expos, tournaments and showcases near you. Grab your tickets before they sell out at ArcadeZenter.",
  alternates: { canonical: "https://arcadezenter.com/events" },
  openGraph: {
    title: "Gaming Events & Tickets | ArcadeZenter",
    description: "Find gaming expos, tournaments and showcases. Grab your tickets before they sell out.",
    url: "https://arcadezenter.com/events",
    type: "website",
  },
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
