// Types and utilities safe to use in both server and client components.
// Server-side Apollo queries are in strapi.ts (server-only).

export interface StrapiMedia {
  documentId: string;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  } | null;
}

export interface Technology {
  documentId: string;
  name: string;
  slug: string;
  category: 'Frontend' | 'Backend' | 'DevOps' | 'Database' | 'Other';
  websiteUrl: string | null;
  icon: StrapiMedia | null;
}

export interface Tag {
  documentId: string;
  name: string;
  slug: string;
  color: string;
  category: 'project' | 'news' | 'article';
}

export interface RichTextBlock {
  type: string;
  level?: number;
  format?: 'ordered' | 'unordered';
  language?: string;
  image?: { url: string; alternativeText?: string; width?: number; height?: number };
  children: Array<{
    type: string;
    text?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    url?: string;
    children?: RichTextBlock['children'];
  }>;
}

export interface WorkExperience {
  documentId: string;
  title: string;
  company: string;
  companyUrl: string | null;
  startDate: string;
  endDate: string | null;
  description: RichTextBlock[];
  isRemote: boolean;
  location: string | null;
  logo: StrapiMedia | null;
  technologies: Technology[];
}

export interface Project {
  documentId: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: RichTextBlock[];
  url: string | null;
  githubUrl: string | null;
  featured: boolean;
  cover: StrapiMedia | null;
  pageCover: StrapiMedia | null;
  showCoverOnPage: boolean;
  screenshots: StrapiMedia[];
  technologies: Technology[];
  tags: Tag[];
}

export interface MdxSection {
  __typename: 'ComponentSectionsMdxSection';
  title: string | null;
  content: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSection {
  __typename: 'ComponentSectionsFaqSection';
  title: string | null;
  items: (FaqItem | null)[] | null;
}

export type ArticleSection = MdxSection | FaqSection;

export interface ArticleSeriesItem {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
}

export interface ArticleSeries {
  documentId: string;
  title: string;
  slug: string;
  description: string | null;
  articles: ArticleSeriesItem[];
}

export interface ArticleSeriesWithCovers {
  documentId: string;
  title: string;
  slug: string;
  description: string | null;
  articles: (ArticleSeriesItem & { publishedAt: string; cover: StrapiMedia | null })[];
}

export interface ArticleCard {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover: StrapiMedia | null;
  tags: Tag[];
  technologies: Technology[];
  publishedAt: string;
  createdAt: string;
}

export interface Article {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: RichTextBlock[];
  mainContent: ArticleSection[];
  cover: StrapiMedia | null;
  pageCover: StrapiMedia | null;
  showCoverOnPage: boolean;
  tags: Tag[];
  technologies: Technology[];
  publishedAt: string;
  createdAt: string;
  relatedArticles: ArticleCard[];
  series: ArticleSeries | null;
  orderInSeries: number | null;
}

export interface NewsItem {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: RichTextBlock[];
  cover: StrapiMedia | null;
  pageCover: StrapiMedia | null;
  showCoverOnPage: boolean;
  tags: Tag[];
  technologies: Technology[];
  projects: Pick<Project, 'documentId' | 'title' | 'slug'>[];
  publishedAt: string;
  createdAt: string;
}

export function mediaUrl(
  media: StrapiMedia | null | undefined,
  size?: 'thumbnail' | 'small' | 'medium' | 'large',
): string | null {
  if (!media) return null;
  if (size && media.formats?.[size]) return media.formats[size]!.url;
  return media.url;
}

export function resolvePageCover<T extends { cover: StrapiMedia | null; pageCover: StrapiMedia | null; showCoverOnPage: boolean }>(
  entity: T,
): StrapiMedia | null {
  if (entity.pageCover) return entity.pageCover;
  if (entity.showCoverOnPage) return entity.cover;
  return null;
}
