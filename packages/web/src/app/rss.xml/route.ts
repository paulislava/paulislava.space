import { getArticles, getNewsItems } from '@/lib/strapi';
import { buildRssFeed } from '@/lib/rss';

export const revalidate = 1800;

const BASE = 'https://paulislava.space';

export async function GET() {
  const [articles, news] = await Promise.all([getArticles(25), getNewsItems(25)]);

  const articleItems = articles.map((a) => ({
    title: a.title,
    link: `${BASE}/articles/${a.slug}`,
    description: a.excerpt ?? '',
    pubDate: new Date(a.publishedAt).toUTCString(),
    guid: `${BASE}/articles/${a.slug}`,
    category: 'article' as const,
    _date: new Date(a.publishedAt).getTime(),
  }));

  const newsItems = news.map((n) => ({
    title: n.title,
    link: `${BASE}/news/${n.slug}`,
    description: n.excerpt ?? '',
    pubDate: new Date(n.publishedAt).toUTCString(),
    guid: `${BASE}/news/${n.slug}`,
    category: 'news' as const,
    _date: new Date(n.publishedAt).getTime(),
  }));

  const items = [...articleItems, ...newsItems]
    .sort((a, b) => b._date - a._date)
    .map(({ _date: _, ...item }) => item);

  const xml = buildRssFeed(items, {
    title: 'Павел Кондратов',
    link: `${BASE}/rss.xml`,
    description: 'Статьи и новости о разработке',
  });

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
