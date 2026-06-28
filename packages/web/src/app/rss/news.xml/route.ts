import { getNewsItems } from '@/lib/strapi';
import { buildRssFeed } from '@/lib/rss';

export const revalidate = 1800;

const BASE = 'https://paulislava.space';

export async function GET() {
  const news = await getNewsItems(25);

  const items = news.map((n) => ({
    title: n.title,
    link: `${BASE}/news/${n.slug}`,
    description: n.excerpt ?? '',
    pubDate: new Date(n.publishedAt).toUTCString(),
    guid: `${BASE}/news/${n.slug}`,
    category: 'news' as const,
  }));

  const xml = buildRssFeed(items, {
    title: 'Павел Кондратов — Новости',
    link: `${BASE}/rss/news.xml`,
    description: 'Новости о проектах и разработке',
  });

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
