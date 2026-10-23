import type { Article, ArticleSeriesWithCovers, NewsItem, Project, StrapiMedia } from './strapi-types.ts';
import { mediaUrl, resolvePageCover } from './strapi-types.ts';

export const SITE_URL = 'https://paulislava.space';
export const SITE_NAME = 'paulislava.space';
export const PERSON_NAME = 'Павел Кондратов';
export const CONTACT_EMAIL = 'i@paulislava.space';
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const CONTEXT = 'https://schema.org';

type JsonLdNode = Record<string, unknown>;
export interface ListEntry { name: string; url: string; id?: string }

export const personJsonLd = {
  '@context': CONTEXT,
  '@type': 'Person',
  '@id': PERSON_ID,
  name: PERSON_NAME,
  alternateName: 'paulislava',
  url: SITE_URL,
  jobTitle: 'Software Engineer',
  worksFor: { '@type': 'Organization', name: 'SberDevices' },
  address: { '@type': 'PostalAddress', addressLocality: 'Екатеринбург', addressCountry: 'RU' },
  sameAs: ['https://github.com/paulislava'],
  email: CONTACT_EMAIL,
  knowsAbout: ['React', 'Next.js', 'NestJS', 'TypeScript', 'DevOps', 'AI agents', 'GigaChat'],
};

const author = { '@type': 'Person', '@id': PERSON_ID, name: PERSON_NAME, url: `${SITE_URL}/` };

export const websiteJsonLd = {
  '@context': CONTEXT,
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: 'ru-RU',
  author: { '@id': PERSON_ID },
  publisher: { '@id': PERSON_ID },
  description: 'Портфолио инженерных кейсов и экспертные статьи Павла Кондратова о frontend, Next.js, архитектуре, platform engineering и AI.',
};

export function absoluteUrl(path: string) {
  return new URL(path, `${SITE_URL}/`).href;
}

// A CMS string must never be able to terminate the HTML script element.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function graph(...nodes: JsonLdNode[]) {
  return { '@context': CONTEXT, '@graph': nodes };
}

function date(value: string | null | undefined) {
  return value && Number.isFinite(Date.parse(value)) ? value : undefined;
}

function modifiedDate(value: string | null | undefined, publishedAt: string | null | undefined) {
  const modified = date(value);
  const published = date(publishedAt);
  return modified && (!published || Date.parse(modified) >= Date.parse(published)) ? modified : undefined;
}

function image(media: StrapiMedia | null | undefined) {
  const url = mediaUrl(media, 'large') ?? mediaUrl(media);
  if (!url) return undefined;
  return {
    '@type': 'ImageObject',
    url: absoluteUrl(url),
    // Dimensions belong to the original image, not a resized CMS variant.
    width: url === media?.url ? media.width ?? undefined : undefined,
    height: url === media?.url ? media.height ?? undefined : undefined,
    caption: media?.alternativeText || undefined,
  };
}

function contentImage(entity: Article | NewsItem | Project) {
  return image(resolvePageCover(entity) ?? entity.cover);
}

function page(path: string, name: string, type = 'WebPage') {
  const url = absoluteUrl(path);
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    inLanguage: 'ru-RU',
    isPartOf: { '@id': WEBSITE_ID },
    author: { '@id': PERSON_ID },
  };
}

export function breadcrumbJsonLd(entries: ListEntry[], path: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(path)}#breadcrumbs`,
    itemListElement: entries.map((entry, i) => ({
      '@type': 'ListItem', position: i + 1, name: entry.name, item: absoluteUrl(entry.url),
    })),
  };
}

export function itemListJsonLd(path: string, name: string, entries: ListEntry[], fragment = 'list') {
  return {
    '@type': 'ItemList',
    '@id': `${absoluteUrl(path)}#${fragment}`,
    name,
    numberOfItems: entries.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: entries.map((entry, i) => ({
      '@type': 'ListItem', position: i + 1, name: entry.name, url: absoluteUrl(entry.url),
      item: { '@id': entry.id ?? `${absoluteUrl(entry.url)}#webpage`, name: entry.name, url: absoluteUrl(entry.url) },
    })),
  };
}

export function filterContent<T extends { tags: { slug: string }[]; technologies: { slug: string }[] }>(
  items: T[], tag: string | null, tech: string | null,
): T[] {
  return items.filter(item => (!tag || item.tags.some(t => t.slug === tag))
    && (!tech || item.technologies.some(t => t.slug === tech)));
}

export function collectionPageJsonLd(path: string, name: string, entries: ListEntry[], parents: ListEntry[] = []) {
  const list = itemListJsonLd(path, name, entries);
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Главная', url: '/' }, ...parents, { name, url: path }], path);
  return graph({
    ...page(path, name, 'CollectionPage'),
    mainEntity: { '@id': list['@id'] },
    breadcrumb: { '@id': breadcrumbs['@id'] },
  }, list, breadcrumbs);
}

export function homePageJsonLd(projects: Pick<Project, 'title' | 'slug'>[]) {
  const list = itemListJsonLd('/', 'Ключевые кейсы', projects.map(p => ({ name: p.title, url: `/projects/${p.slug}`, id: `${absoluteUrl(`/projects/${p.slug}`)}#project` })), 'projects');
  return graph({
    ...page('/', `${PERSON_NAME} — Software Engineer`, 'ProfilePage'),
    mainEntity: { '@id': PERSON_ID },
    mentions: { '@id': list['@id'] },
  }, list);
}

export function articleJsonLd(article: Article) {
  const url = absoluteUrl(`/articles/${article.slug}`);
  return {
    '@context': CONTEXT,
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.excerpt || undefined,
    url,
    image: contentImage(article),
    datePublished: date(article.publishedAt ?? article.createdAt),
    dateModified: modifiedDate(article.updatedAt, article.publishedAt ?? article.createdAt),
    inLanguage: 'ru-RU',
    author,
    publisher: author,
    about: [...article.tags, ...article.technologies].map(t => ({ '@type': 'Thing', name: t.name })),
    articleSection: article.tags.map(t => t.name),
    keywords: [...article.tags, ...article.technologies].map(t => t.name),
    isPartOf: article.series ? { '@type': 'CreativeWorkSeries', '@id': `${absoluteUrl(`/series/${article.series.slug}`)}#series`, name: article.series.title, url: absoluteUrl(`/series/${article.series.slug}`) } : { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@id': `${url}#webpage` },
  };
}

export function newsJsonLd(item: NewsItem) {
  const url = absoluteUrl(`/news/${item.slug}`);
  return {
    '@context': CONTEXT,
    '@type': 'NewsArticle',
    '@id': `${url}#article`,
    headline: item.title,
    description: item.excerpt || undefined,
    url,
    image: contentImage(item),
    // News pages display createdAt; Strapi publishedAt changes on re-publication.
    datePublished: date(item.createdAt ?? item.publishedAt),
    dateModified: modifiedDate(item.updatedAt, item.createdAt ?? item.publishedAt),
    inLanguage: 'ru-RU',
    author,
    publisher: author,
    keywords: [...item.tags, ...item.technologies].map(t => t.name),
    mentions: item.projects.map(p => ({ '@type': 'CreativeWork', '@id': `${absoluteUrl(`/projects/${p.slug}`)}#project`, name: p.title, url: absoluteUrl(`/projects/${p.slug}`) })),
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@id': `${url}#webpage` },
  };
}

export function projectJsonLd(project: Project) {
  const url = absoluteUrl(`/projects/${project.slug}`);
  const images = [contentImage(project), ...(project.screenshots ?? []).map(image)].filter(i => i !== undefined);
  return {
    '@context': CONTEXT,
    '@type': 'CreativeWork',
    '@id': `${url}#project`,
    name: project.title,
    description: project.shortDescription?.trim() || undefined,
    url,
    image: images.length ? [...new Map(images.map(i => [i.url, i])).values()] : undefined,
    author,
    creator: author,
    inLanguage: 'ru-RU',
    about: [...project.tags, ...project.technologies].map(t => ({ '@type': 'Thing', name: t.name })),
    sameAs: [project.url, project.githubUrl].filter(Boolean),
    keywords: [...project.tags, ...project.technologies].map(t => t.name),
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@id': `${url}#webpage` },
  };
}

function detailPageJsonLd(path: string, name: string, entity: ReturnType<typeof articleJsonLd> | ReturnType<typeof newsJsonLd> | ReturnType<typeof projectJsonLd>, parents: ListEntry[], pageImage: ReturnType<typeof image>) {
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Главная', url: '/' }, ...parents, { name, url: path }], path);
  return graph({
    ...page(path, name),
    mainEntity: { '@id': entity['@id'] },
    breadcrumb: { '@id': breadcrumbs['@id'] },
    primaryImageOfPage: pageImage,
  }, entity, breadcrumbs);
}

export function articlePageJsonLd(article: Article) {
  const path = `/articles/${article.slug}`;
  const result = detailPageJsonLd(path, article.title, articleJsonLd(article), [{ name: 'Статьи', url: '/articles' }], image(resolvePageCover(article)));
  const questions = (article.mainContent ?? []).flatMap(section => section.__typename === 'ComponentSectionsFaqSection' ? section.items ?? [] : [])
    .filter(item => item && item.question.trim() && item.answer.trim())
    .map(item => ({ '@type': 'Question', name: item!.question, acceptedAnswer: { '@type': 'Answer', text: item!.answer } }));
  if (questions.length) result['@graph'].push({
    '@type': 'FAQPage', '@id': `${absoluteUrl(path)}#faq`, url: absoluteUrl(path),
    isPartOf: { '@id': `${absoluteUrl(path)}#webpage` }, inLanguage: 'ru-RU', mainEntity: questions,
  });
  return result;
}

export function newsPageJsonLd(item: NewsItem) {
  // News are linked from the homepage; there is no /news catalog.
  return detailPageJsonLd(`/news/${item.slug}`, item.title, newsJsonLd(item), [], image(resolvePageCover(item)));
}

export function projectPageJsonLd(project: Project) {
  return detailPageJsonLd(`/projects/${project.slug}`, project.title, projectJsonLd(project), [{ name: 'Проекты', url: '/projects' }], image(resolvePageCover(project)));
}

export function seriesPageJsonLd(series: ArticleSeriesWithCovers) {
  const path = `/series/${series.slug}`;
  const entries = series.articles.map(a => ({ name: a.title, url: `/articles/${a.slug}`, id: `${absoluteUrl(`/articles/${a.slug}`)}#article` }));
  const result = collectionPageJsonLd(path, series.title, entries, [{ name: 'Циклы статей', url: '/series' }]);
  const seriesId = `${absoluteUrl(path)}#series`;
  result['@graph'][0].about = { '@id': seriesId };
  result['@graph'].push({
    '@type': 'CreativeWorkSeries', '@id': seriesId, name: series.title,
    description: series.description || undefined, url: absoluteUrl(path),
    author, inLanguage: 'ru-RU', mainEntityOfPage: { '@id': `${absoluteUrl(path)}#webpage` },
    hasPart: entries.map(e => ({ '@type': 'BlogPosting', '@id': e.id, name: e.name, url: absoluteUrl(e.url) })),
  });
  return result;
}

// This same content is rendered by the business landing.
export const BUSINESS_SERVICES = [
  { slug: 'sites', name: 'Сайты и лендинги', description: 'Покажите, чем сильна ваша компания. Помогу представить продукт, объяснить сложное и привести посетителя к обращению.' },
  { slug: 'platforms', name: 'Сервисы и платформы', description: 'Поиск, личные кабинеты, роли и работа с данными. Когда бизнесу нужен собственный инструмент, разработаю его под ваших клиентов и команду.' },
  { slug: 'automation', name: 'Автоматизация и интеграции', description: 'Заявки, документы, уведомления и передача данных между сервисами. Повторяющиеся операции можно поручить системе.' },
];

export function businessPageJsonLd() {
  const path = '/zakazat-sait-avtomatizaciyu';
  const url = absoluteUrl(path);
  const services = BUSINESS_SERVICES.map(service => ({
    '@type': 'Service', '@id': `${url}#${service.slug}`, name: service.name,
    description: service.description, serviceType: service.name, url: `${url}#services`, provider: { '@id': PERSON_ID },
  }));
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Главная', url: '/' }, { name: 'Разработка для бизнеса', url: path }], path);
  return graph({
    ...page(path, 'Сайты, сервисы и автоматизация для бизнеса'),
    mainEntity: services.map(s => ({ '@id': s['@id'] })), breadcrumb: { '@id': breadcrumbs['@id'] },
  }, ...services, breadcrumbs);
}
