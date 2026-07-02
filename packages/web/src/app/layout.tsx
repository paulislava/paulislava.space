import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/ui/NavBar';
import Contact from '@/components/sections/Contact';
import YandexMetrika from '@/components/analytics/YandexMetrika';
import { personJsonLd, websiteJsonLd } from '@/lib/seo';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Павел Кондратов — Software Engineer', template: '%s | Павел Кондратов' },
  description: 'Software Engineer — React, Next.js, NestJS, DevOps. Портфолио проектов и статьи.',
  metadataBase: new URL('https://paulislava.space'),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/icons/icon-16x16.png',   sizes: '16x16',   type: 'image/png' },
      { url: '/icons/icon-32x32.png',   sizes: '32x32',   type: 'image/png' },
      { url: '/icons/icon-48x48.png',   sizes: '48x48',   type: 'image/png' },
      { url: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png',        sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-57x57.png',        sizes: '57x57',   type: 'image/png' },
      { url: '/icons/icon-60x60.png',        sizes: '60x60',   type: 'image/png' },
      { url: '/icons/icon-72x72.png',        sizes: '72x72',   type: 'image/png' },
      { url: '/icons/icon-76x76.png',        sizes: '76x76',   type: 'image/png' },
      { url: '/icons/icon-114x114.png',      sizes: '114x114', type: 'image/png' },
      { url: '/icons/icon-120x120.png',      sizes: '120x120', type: 'image/png' },
      { url: '/icons/icon-144x144.png',      sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-152x152.png',      sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-167x167.png',      sizes: '167x167', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://paulislava.space',
    siteName: 'paulislava.space',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'Павел Кондратов — Всё' },
        { url: '/rss/articles.xml', title: 'Павел Кондратов — Статьи' },
        { url: '/rss/news.xml', title: 'Павел Кондратов — Новости' },
      ],
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([personJsonLd, websiteJsonLd]) }}
        />
      </head>
      <body>
        <YandexMetrika />
        <NavBar />
        {children}
        <Contact />
      </body>
    </html>
  );
}
