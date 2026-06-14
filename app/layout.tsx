import type { Metadata, Viewport } from 'next'
// @ts-ignore: side-effect import for global CSS
import "../styles/globals.css";
import { Inter, Calistoga } from 'next/font/google'
import { Providers } from '@/app/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CommandPalette } from '@/components/layout/command-palette'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const calistoga = Calistoga({ weight: '400', subsets: ['latin'], variable: '--font-calistoga' })

export const metadata: Metadata = {
  title: 'ModernStore - Premium E-commerce Solution',
  description: 'The ultimate e-commerce platform for modern businesses',
  keywords: 'ecommerce, saas, online store, shopping',
  authors: [{ name: 'ModernStore' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${calistoga.variable} font-sans`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CommandPalette />
        </Providers>
      </body>
    </html>
  )
}