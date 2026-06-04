import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Official Merchandise",
  description: "Shop official ArcadeZenter merchandise — apparel, collectibles, accessories and gaming peripherals.",
  alternates: { canonical: "https://arcadezenter.com/merchandise" },
  openGraph: {
    title: "Official Merchandise | ArcadeZenter",
    description: "Shop official ArcadeZenter merchandise — apparel, collectibles, accessories and gaming peripherals.",
    url: "https://arcadezenter.com/merchandise",
    type: "website",
  },
}

export default function MerchandiseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
