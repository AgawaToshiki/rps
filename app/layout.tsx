import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'うぇぶじゃんけん',
  description: 'Web上で気軽にじゃんけん',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className}, bg-main-color text-font-color m-0 p-0`}>{children}</body>
    </html>
  )
}
