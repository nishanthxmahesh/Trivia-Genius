import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
}

export const metadata: Metadata = {
  title: "TriviaGenius",
  description: "Generate and take quizzes powered by AI.",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#0a0f1e] text-slate-300 font-sans antialiased selection:bg-blue-500/30">
        <div className="flex min-h-screen">
          <ServiceWorkerRegister />
          <Navbar />
          <main className="flex-1 max-w-[1200px] mx-auto w-full relative">{children}</main>
        </div>
      </body>
    </html>
  )
}