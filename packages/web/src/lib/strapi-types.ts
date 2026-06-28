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
  children: Array<{
    type: string;
    text?: string;
    bold?: boolean;
    italic?: boolean;
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
  items: FaqItem[];
}

export type ArticleSection = MdxSection | FaqSection;

export interface Article {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: RichTextBlock[];
  mainContent: ArticleSection[];
  cover: StrapiMedia | null;
  tags: Tag[];
  technologies: Technology[];
  publishedAt: string;
  createdAt: string;
}

export interface NewsItem {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: RichTextBlock[];
  cover: StrapiMedia | null;
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
