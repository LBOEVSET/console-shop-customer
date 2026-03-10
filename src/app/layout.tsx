import "./globals.css"
import type { Metadata } from "next"
import AppProvider from "@/providers/app-provider"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import PopupChat from "@/components/chat/popup-chat"
import AuthInitializer from "@/components/auth/auth-initializer"
import GuestInitializer from "@/components/auth/GuestInitializer"

export const metadata: Metadata = {
  title: "Arcade Zenter",
  description: "Console Games & Accessories Marketplace",
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

          <main className="flex-1 w-full pt-24">
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
