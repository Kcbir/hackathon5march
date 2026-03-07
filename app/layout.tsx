import type { Metadata, Viewport } from 'next'
import { Poppins, Geist_Mono } from 'next/font/google'
import './globals.css'

const _poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: 'Petpooja Vani — AI Voice Copilot for Restaurants',
  description: 'Smart voice ordering, AI menu intelligence, and automated upselling integrated with Petpooja POS. Automate orders and boost profits with AI.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#CF1F2E',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_poppins.variable} ${_geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
