import type { Article, NewsItem, Project } from '@/lib/strapi-types';
import { mediaUrl } from '@/lib/strapi-types';

export const SITE_URL = 'https://paulislava.space';
export const SITE_NAME = 'paulislava.space';
export const PERSON_NAME = 'Павел Кондратов';
export const CONTACT_EMAIL = 'i@paulislava.space';

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: PERSON_NAME,
  url: SITE_URL,
  jobTitle: 'Software Engineer',
  worksFor: { '@type': 'Organization', name: 'SberDevices' },
  sameAs: ['https://github.com/paulislava'],
  email: CONTACT_EMAIL,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Екатеринбург',
    addressCountry: 'RU',
  },
  knowsAbout: [
    'React',
    'Next.js',
    'NestJS',
    'TypeScript',
    'DevOps',
    'AI agents',
    'GigaChat',
  ],
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: 'ru-RU',
  author: { '@id': `${SITE_URL}/#person` },
  publisher: { '@id': `${SITE_URL}/#person` },
  description: 'Портфолио, проекты и статьи Павла Кондратова о разработке, архитектуре и технологиях.',
};

export function absoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function imageUrl(media: Article['cover'] | Project['cover'] | NewsItem['cover']) {
  const url = mediaUrl(media, 'large') ?? mediaUrl(media);
  return url ? absoluteUrl(url) : undefined;
}

export function articleJsonLd(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt ?? undefined,
    url: absoluteUrl(`/articles/${article.slug}`),
    image: imageUrl(article.cover),
    datePublished: article.publishedAt,
    dateModified: article.publishedAt ?? article.createdAt,
    inLanguage: 'ru-RU',
    author: { '@id': `${SITE_URL}/#person` },
    publisher: { '@id': `${SITE_URL}/#person` },
    keywords: [
      ...article.tags.map((tag) => tag.name),
      ...article.technologies.map((tech) => tech.name),
    ],
    mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`),
  };
}

export function newsJsonLd(item: NewsItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.excerpt ?? undefined,
    url: absoluteUrl(`/news/${item.slug}`),
    image: imageUrl(item.cover),
    datePublished: item.publishedAt,
    dateModified: item.publishedAt ?? item.createdAt,
    inLanguage: 'ru-RU',
    author: { '@id': `${SITE_URL}/#person` },
    publisher: { '@id': `${SITE_URL}/#person` },
    keywords: [
      ...item.tags.map((tag) => tag.name),
      ...item.technologies.map((tech) => tech.name),
    ],
    mainEntityOfPage: absoluteUrl(`/news/${item.slug}`),
  };
}

export function projectJsonLd(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.shortDescription ?? undefined,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: imageUrl(project.cover),
    author: { '@id': `${SITE_URL}/#person` },
    creator: { '@id': `${SITE_URL}/#person` },
    inLanguage: 'ru-RU',
    sameAs: [project.url, project.githubUrl].filter(Boolean),
    keywords: [
      ...project.tags.map((tag) => tag.name),
      ...project.technologies.map((tech) => tech.name),
    ],
    mainEntityOfPage: absoluteUrl(`/projects/${project.slug}`),
  };
}
