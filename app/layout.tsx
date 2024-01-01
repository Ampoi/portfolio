import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'bootstrap-icons/font/bootstrap-icons.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ampoi',
  description: 'Ampoiの作品・作字を置いているポートフォリオ',
  openGraph: {
    siteName: "Ampoi Portfolio",
    images: { url: "https://ampoi.net/OGP.webp" },
    
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
