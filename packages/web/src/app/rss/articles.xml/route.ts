import { getArticles } from '@/lib/strapi';
import { buildRssFeed } from '@/lib/rss';

export const revalidate = 1800;

const BASE = 'https://paulislava.space';

export async function GET() {
  const articles = await getArticles(25);

  const items = articles.map((a) => ({
    title: a.title,
    link: `${BASE}/articles/${a.slug}`,
    description: a.excerpt ?? '',
    pubDate: new Date(a.publishedAt).toUTCString(),
    guid: `${BASE}/articles/${a.slug}`,
    category: 'article' as const,
  }));

  const xml = buildRssFeed(items, {
    title: 'Павел Кондратов — Статьи',
    link: `${BASE}/rss/articles.xml`,
    description: 'Статьи о разработке и технологиях',
  });

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
