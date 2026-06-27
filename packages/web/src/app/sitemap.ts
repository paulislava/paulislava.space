import { MetadataRoute } from 'next';
import { getAllProjects, getArticles, getNewsItems } from '@/lib/strapi';

const BASE = 'https://paulislava.space';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, articles, news] = await Promise.all([
    getAllProjects(),
    getArticles(100),
    getNewsItems(100),
  ]);

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...projects.map((p) => ({
      url: `${BASE}/projects/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: new Date(a.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...news.map((n) => ({
      url: `${BASE}/news/${n.slug}`,
      lastModified: new Date(n.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
