import 'server-only';
import type { OperationVariables } from '@apollo/client';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { getClient } from './apollo';
import type { NextCacheOptions } from './apollo';
import {
  GetTechnologiesDocument,
  GetWorkExperiencesDocument,
  GetFeaturedProjectsDocument,
  GetAllProjectsDocument,
  GetProjectBySlugDocument,
  GetArticlesDocument,
  GetAllArticlesDocument,
  GetArticleBySlugDocument,
  GetNewsItemsDocument,
  GetNewsBySlugDocument,
  GetAllProjectTagsDocument,
} from '@/gql/graphql';

export type { StrapiMedia, Technology, WorkExperience, Project, Article, NewsItem, Tag, RichTextBlock } from './strapi-types';
export { mediaUrl } from './strapi-types';
import type { Technology, WorkExperience, Project, Article, NewsItem, Tag } from './strapi-types';

async function gqlQuery<TData, TVariables extends OperationVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
  cache?: NextCacheOptions,
): Promise<TData> {
  // Apollo v4 VariablesOption требует точного типа; any только здесь
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getClient(cache).query({ query: document, variables: variables as any, fetchPolicy: 'no-cache' });
  if (!result.data) throw new Error('No data returned from GraphQL');
  return result.data;
}

export async function getTechnologies(): Promise<Technology[]> {
  const data = await gqlQuery(GetTechnologiesDocument, undefined, {
    tags: ['technologies'],
    revalidate: 86400,
  });
  return (data.technologies ?? []) as unknown as Technology[];
}

export async function getWorkExperiences(): Promise<WorkExperience[]> {
  const data = await gqlQuery(GetWorkExperiencesDocument, undefined, {
    tags: ['work-experiences'],
    revalidate: 86400,
  });
  return (data.workExperiences ?? []) as unknown as WorkExperience[];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const data = await gqlQuery(GetFeaturedProjectsDocument, undefined, {
    tags: ['projects'],
    revalidate: 3600,
  });
  return (data.projects ?? []) as unknown as Project[];
}

export async function getAllProjects(): Promise<Project[]> {
  const data = await gqlQuery(GetAllProjectsDocument, undefined, {
    tags: ['projects'],
    revalidate: 3600,
  });
  return (data.projects ?? []) as unknown as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const data = await gqlQuery(GetProjectBySlugDocument, { slug }, {
    tags: ['projects', `project-${slug}`],
    revalidate: 3600,
  });
  return (data.projects?.[0] ?? null) as unknown as Project | null;
}

export async function getAllArticles(): Promise<Article[]> {
  const data = await gqlQuery(GetAllArticlesDocument, undefined, {
    tags: ['articles'],
    revalidate: 1800,
  });
  return (data.articles ?? []) as unknown as Article[];
}

export async function getArticles(limit = -1): Promise<Article[]> {
  const data = await gqlQuery(GetArticlesDocument, { limit }, {
    tags: ['articles'],
    revalidate: 1800,
  });
  return (data.articles ?? []) as unknown as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const data = await gqlQuery(GetArticleBySlugDocument, { slug }, {
    tags: ['articles', `article-${slug}`],
    revalidate: 1800,
  });
  return (data.articles?.[0] ?? null) as unknown as Article | null;
}

export async function getNewsItems(limit = 10): Promise<NewsItem[]> {
  const data = await gqlQuery(GetNewsItemsDocument, { limit }, {
    tags: ['news'],
    revalidate: 900,
  });
  return (data.news_items ?? []) as unknown as NewsItem[];
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const data = await gqlQuery(GetNewsBySlugDocument, { slug }, {
    tags: ['news', `news-${slug}`],
    revalidate: 900,
  });
  return (data.news_items?.[0] ?? null) as unknown as NewsItem | null;
}

export async function getProjectTags(): Promise<Tag[]> {
  const data = await gqlQuery(GetAllProjectTagsDocument, undefined, {
    tags: ['tags'],
    revalidate: 86400,
  });
  return (data.tags ?? []) as unknown as Tag[];
}
