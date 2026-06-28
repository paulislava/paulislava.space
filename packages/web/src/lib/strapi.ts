import 'server-only';
import { print } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import {
  GetTechnologiesDocument,
  GetWorkExperiencesDocument,
  GetFeaturedProjectsDocument,
  GetAllProjectsDocument,
  GetProjectBySlugDocument,
  GetArticlesDocument,
  GetArticleBySlugDocument,
  GetNewsItemsDocument,
  GetNewsBySlugDocument,
  GetAllProjectTagsDocument,
} from '@/gql/graphql';

export type { StrapiMedia, Technology, WorkExperience, Project, Article, NewsItem, Tag, RichTextBlock } from './strapi-types';
export { mediaUrl } from './strapi-types';
import type { Technology, WorkExperience, Project, Article, NewsItem, Tag } from './strapi-types';

const STRAPI_URL = process.env.STRAPI_URL || 'https://cms.paulislava.space';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

interface GqlOptions {
  tags?: string[];
  revalidate?: number;
}

async function gqlFetch<TData, TVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
  options?: GqlOptions,
): Promise<TData> {
  const res = await fetch(`${STRAPI_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    body: JSON.stringify({ query: print(document), variables }),
    next: {
      tags: options?.tags,
      revalidate: options?.revalidate,
    },
  });

  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);

  const json = (await res.json()) as { data?: TData; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(', '));
  if (!json.data) throw new Error('No data returned from GraphQL');

  return json.data;
}

export async function getTechnologies(): Promise<Technology[]> {
  const data = await gqlFetch(GetTechnologiesDocument, undefined, {
    tags: ['technologies'],
    revalidate: 86400, // 24h — справочник, меняется редко
  });
  return (data.technologies ?? []) as unknown as Technology[];
}

export async function getWorkExperiences(): Promise<WorkExperience[]> {
  const data = await gqlFetch(GetWorkExperiencesDocument, undefined, {
    tags: ['work-experiences'],
    revalidate: 86400, // 24h
  });
  return (data.workExperiences ?? []) as unknown as WorkExperience[];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const data = await gqlFetch(GetFeaturedProjectsDocument, undefined, {
    tags: ['projects'],
    revalidate: 3600, // 1h
  });
  return (data.projects ?? []) as unknown as Project[];
}

export async function getAllProjects(): Promise<Project[]> {
  const data = await gqlFetch(GetAllProjectsDocument, undefined, {
    tags: ['projects'],
    revalidate: 3600, // 1h
  });
  return (data.projects ?? []) as unknown as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const data = await gqlFetch(GetProjectBySlugDocument, { slug }, {
    tags: ['projects', `project-${slug}`],
    revalidate: 3600, // 1h
  });
  return (data.projects?.[0] ?? null) as unknown as Project | null;
}

export async function getArticles(limit = 10): Promise<Article[]> {
  const data = await gqlFetch(GetArticlesDocument, { limit }, {
    tags: ['articles'],
    revalidate: 1800, // 30min
  });
  return (data.articles ?? []) as unknown as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const data = await gqlFetch(GetArticleBySlugDocument, { slug }, {
    tags: ['articles', `article-${slug}`],
    revalidate: 1800, // 30min
  });
  return (data.articles?.[0] ?? null) as unknown as Article | null;
}

export async function getNewsItems(limit = 10): Promise<NewsItem[]> {
  const data = await gqlFetch(GetNewsItemsDocument, { limit }, {
    tags: ['news'],
    revalidate: 900, // 15min — новости обновляются часто
  });
  return (data.news_items ?? []) as unknown as NewsItem[];
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const data = await gqlFetch(GetNewsBySlugDocument, { slug }, {
    tags: ['news', `news-${slug}`],
    revalidate: 900, // 15min
  });
  return (data.news_items?.[0] ?? null) as unknown as NewsItem | null;
}

export async function getProjectTags(): Promise<Tag[]> {
  const data = await gqlFetch(GetAllProjectTagsDocument, undefined, {
    tags: ['tags'],
    revalidate: 86400, // 24h
  });
  return (data.tags ?? []) as unknown as Tag[];
}
