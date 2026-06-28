import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/ui/NavBar';
import Contact from '@/components/sections/Contact';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Павел Кондратов — Software Engineer', template: '%s | Павел Кондратов' },
  description: 'Software Engineer — React, Next.js, NestJS, DevOps. Портфолио проектов и статьи.',
  metadataBase: new URL('https://paulislava.space'),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://paulislava.space',
    siteName: 'paulislava.space',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Павел Кондратов',
  url: 'https://paulislava.space',
  jobTitle: 'Software Engineer',
  worksFor: { '@type': 'Organization', name: 'SberDevices' },
  sameAs: ['https://github.com/paulislava'],
  email: 'i@paulislava.space',
  address: { '@type': 'PostalAddress', addressLocality: 'Екатеринбург', addressCountry: 'RU' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NavBar />
        {children}
        <Contact />
      </body>
    </html>
  );
}
