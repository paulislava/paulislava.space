// Types and utilities safe to use in both server and client components.
// Server-side Apollo queries are in strapi.ts (server-only).

export interface StrapiMedia {
  id: number;
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
  id: number;
  documentId: string;
  name: string;
  slug: string;
  category: 'Frontend' | 'Backend' | 'DevOps' | 'Database' | 'Other';
  websiteUrl: string | null;
  icon: StrapiMedia | null;
}

export interface Tag {
  id: number;
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
  id: number;
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
  id: number;
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

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: RichTextBlock[];
  cover: StrapiMedia | null;
  tags: Tag[];
  technologies: Technology[];
  publishedAt: string;
  createdAt: string;
}

export interface NewsItem {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: RichTextBlock[];
  cover: StrapiMedia | null;
  tags: Tag[];
  technologies: Technology[];
  projects: Pick<Project, 'id' | 'documentId' | 'title' | 'slug'>[];
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
