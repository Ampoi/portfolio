import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'bootstrap-icons/font/bootstrap-icons.css'

const inter = Inter({ subsets: ['latin'] })
const siteName = "Ampoi"
const url = "https://ampoi.net"
const description = "プログラミングが好きな高校生"

export const metadata: Metadata = {
  title: siteName,
  description,
  openGraph: {
    title: siteName,
    description,
    url,
    siteName,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description,
    creator: '@Ampoi',
  },
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
