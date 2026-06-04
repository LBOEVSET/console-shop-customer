import "./globals.css"
import type { Metadata } from "next"
import AppProvider from "@/providers/app-provider"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import PopupChat from "@/components/chat/popup-chat"
import AuthInitializer from "@/components/auth/auth-initializer"
import GuestInitializer from "@/components/auth/GuestInitializer"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arcadezenter.com"
const SITE_NAME = "ArcadeZenter"
const DEFAULT_DESCRIPTION = "Buy digital game keys for PlayStation, PC, Xbox and Nintendo. Instant delivery, best prices."
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Digital Game Keys & Console Store`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "game keys", "digital games", "PlayStation", "Xbox", "Nintendo", "PC games",
    "buy games online", "cheap game keys", "instant delivery", "console games",
    "ArcadeZenter",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Digital Game Keys & Console Store`,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@arcadezenter",
    title: `${SITE_NAME} — Digital Game Keys & Console Store`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white min-h-screen flex flex-col">

        <AppProvider>

          {/* Init auth + guest */}
          <AuthInitializer />
          <GuestInitializer />

          <Navbar />

          <main className="flex-1 w-full pt-24 md:pt-32">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>

          <Footer />
          <PopupChat />

        </AppProvider>

        <script src="https://cdn.omise.co/omise.js"></script>

      </body>
    </html>
  )
}
