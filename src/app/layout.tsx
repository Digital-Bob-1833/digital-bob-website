import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Digital Bob - Personal Website',
  description: 'Personal website featuring an AI chatbot to learn about Bob Hackney',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-blue-100 to-white`}>
        {children}
      </body>
    </html>
  )
}
