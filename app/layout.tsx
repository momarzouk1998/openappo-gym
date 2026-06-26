import type { Metadata } from 'next'
import { Cairo, IBM_Plex_Sans_Arabic, Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const ibmPlex = IBM_Plex_Sans_Arabic({
  variable: '--font-ibm',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OpenGym | نظام إدارة الجيمات في مصر',
  description:
    'نظام SaaS متكامل لإدارة الجيمات — اشتراكات، مدفوعات، أعضاء، تقارير، فروع. كل حاجة في مكان واحد.',
  keywords: [
    'إدارة الجيمات',
    'نظام جم',
    'اشتراكات الجم',
    'إدارة الأعضاء',
    'تقارير الجم',
    'OpenGym',
    'gym management',
    'egypt',
  ],
  authors: [{ name: 'OpenAppo' }],
  openGraph: {
    title: 'OpenGym | نظام إدارة الجيمات في مصر',
    description:
      'إدارة جيمك من شاشة واحدة — اشتراكات، مدفوعات، تقارير، أعضاء',
    url: 'https://opengym.openappo.com',
    siteName: 'OpenGym',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenGym | نظام إدارة الجيمات',
    description: 'إدارة جيمك من شاشة واحدة',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${ibmPlex.variable} ${inter.variable} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'OpenGym',
              applicationCategory: 'BusinessApplication',
              description: 'نظام إدارة الجيمات في مصر',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '299',
                priceCurrency: 'EGP',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#0A0A0F] text-[#F8FAFC] font-ibm">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
