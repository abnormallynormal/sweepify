import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Sweepify - Clean Up Our World Together",
  description: "Join the movement to clean up our environment, one sweep at a time.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter antialiased bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
