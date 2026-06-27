import 'server-only';
import type { OperationVariables } from '@apollo/client';
import { getClient } from './apollo';
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
} from '@/gql/graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

export type { StrapiMedia, Technology, WorkExperience, Project, Article, NewsItem, Tag, RichTextBlock } from './strapi-types';
export { mediaUrl } from './strapi-types';
import type { Technology, WorkExperience, Project, Article, NewsItem } from './strapi-types';

async function gqlQuery<TData, TVariables extends OperationVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
): Promise<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getClient().query<TData, any>({ query: document, variables });
  if (!result.data) throw new Error('No data returned from GraphQL');
  return result.data;
}

export async function getTechnologies(): Promise<Technology[]> {
  const data = await gqlQuery(GetTechnologiesDocument);
  return (data.technologies ?? []) as unknown as Technology[];
}

export async function getWorkExperiences(): Promise<WorkExperience[]> {
  const data = await gqlQuery(GetWorkExperiencesDocument);
  return (data.workExperiences ?? []) as unknown as WorkExperience[];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const data = await gqlQuery(GetFeaturedProjectsDocument);
  return (data.projects ?? []) as unknown as Project[];
}

export async function getAllProjects(): Promise<Project[]> {
  const data = await gqlQuery(GetAllProjectsDocument);
  return (data.projects ?? []) as unknown as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const data = await gqlQuery(GetProjectBySlugDocument, { slug });
  return (data.projects?.[0] ?? null) as unknown as Project | null;
}

export async function getArticles(limit = 10): Promise<Article[]> {
  const data = await gqlQuery(GetArticlesDocument, { limit });
  return (data.articles ?? []) as unknown as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const data = await gqlQuery(GetArticleBySlugDocument, { slug });
  return (data.articles?.[0] ?? null) as unknown as Article | null;
}

export async function getNewsItems(limit = 10): Promise<NewsItem[]> {
  const data = await gqlQuery(GetNewsItemsDocument, { limit });
  return (data.news_items ?? []) as unknown as NewsItem[];
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const data = await gqlQuery(GetNewsBySlugDocument, { slug });
  return (data.news_items?.[0] ?? null) as unknown as NewsItem | null;
}
