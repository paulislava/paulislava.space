import 'server-only';
import { gql } from '@apollo/client';
import { getClient } from './apollo';
export type {
  StrapiMedia,
  Technology,
  Tag,
  RichTextBlock,
  WorkExperience,
  Project,
  Article,
  NewsItem,
} from './strapi-types';
export { mediaUrl } from './strapi-types';
import type {
  StrapiMedia,
  Technology,
  Tag,
  WorkExperience,
  Project,
  Article,
  NewsItem,
} from './strapi-types';

// ─── Fragments ────────────────────────────────────────────────────────────────

const MEDIA_FIELDS = gql`
  fragment MediaFields on UploadFile {
    id
    url
    alternativeText
    width
    height
    formats
  }
`;

const TECHNOLOGY_FIELDS = gql`
  fragment TechnologyFields on Technology {
    id
    documentId
    name
    slug
    category
    websiteUrl
    icon {
      ...MediaFields
    }
  }
  ${MEDIA_FIELDS}
`;

const TAG_FIELDS = gql`
  fragment TagFields on Tag {
    id
    documentId
    name
    slug
    color
    category
  }
`;

const PROJECT_CARD_FIELDS = gql`
  fragment ProjectCardFields on Project {
    id
    documentId
    title
    slug
    shortDescription
    url
    githubUrl
    featured
    cover {
      ...MediaFields
    }
    technologies {
      ...TechnologyFields
    }
    tags {
      ...TagFields
    }
  }
  ${MEDIA_FIELDS}
  ${TECHNOLOGY_FIELDS}
  ${TAG_FIELDS}
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

const GET_TECHNOLOGIES = gql`
  query GetTechnologies {
    technologies(pagination: { limit: 100 }, sort: "category:asc,name:asc") {
      ...TechnologyFields
    }
  }
  ${TECHNOLOGY_FIELDS}
`;

const GET_WORK_EXPERIENCES = gql`
  query GetWorkExperiences {
    workExperiences(pagination: { limit: 100 }, sort: "startDate:desc") {
      id
      documentId
      title
      company
      companyUrl
      startDate
      endDate
      description
      isRemote
      location
      logo {
        ...MediaFields
      }
      technologies {
        ...TechnologyFields
      }
    }
  }
  ${MEDIA_FIELDS}
  ${TECHNOLOGY_FIELDS}
`;

const GET_FEATURED_PROJECTS = gql`
  query GetFeaturedProjects {
    projects(
      filters: { featured: { eq: true } }
      pagination: { limit: 20 }
      sort: "createdAt:desc"
    ) {
      ...ProjectCardFields
      screenshots {
        ...MediaFields
      }
    }
  }
  ${PROJECT_CARD_FIELDS}
  ${MEDIA_FIELDS}
`;

const GET_ALL_PROJECTS = gql`
  query GetAllProjects {
    projects(pagination: { limit: 100 }, sort: "createdAt:desc", status: PUBLISHED) {
      ...ProjectCardFields
    }
  }
  ${PROJECT_CARD_FIELDS}
`;

const GET_PROJECT_BY_SLUG = gql`
  query GetProjectBySlug($slug: String!) {
    projects(filters: { slug: { eq: $slug } }, pagination: { limit: 1 }) {
      ...ProjectCardFields
      description
      screenshots {
        ...MediaFields
      }
    }
  }
  ${PROJECT_CARD_FIELDS}
  ${MEDIA_FIELDS}
`;

const GET_ARTICLES = gql`
  query GetArticles($limit: Int = 10) {
    articles(pagination: { limit: $limit }, sort: "createdAt:desc", status: PUBLISHED) {
      id
      documentId
      title
      slug
      excerpt
      createdAt
      publishedAt
      cover {
        ...MediaFields
      }
      tags {
        ...TagFields
      }
      technologies {
        ...TechnologyFields
      }
    }
  }
  ${MEDIA_FIELDS}
  ${TAG_FIELDS}
  ${TECHNOLOGY_FIELDS}
`;

const GET_ARTICLE_BY_SLUG = gql`
  query GetArticleBySlug($slug: String!) {
    articles(
      filters: { slug: { eq: $slug } }
      pagination: { limit: 1 }
      status: PUBLISHED
    ) {
      id
      documentId
      title
      slug
      excerpt
      content
      createdAt
      publishedAt
      cover {
        ...MediaFields
      }
      tags {
        ...TagFields
      }
      technologies {
        ...TechnologyFields
      }
    }
  }
  ${MEDIA_FIELDS}
  ${TAG_FIELDS}
  ${TECHNOLOGY_FIELDS}
`;

const GET_NEWS_ITEMS = gql`
  query GetNewsItems($limit: Int = 10) {
    newsItems(pagination: { limit: $limit }, sort: "createdAt:desc", status: PUBLISHED) {
      id
      documentId
      title
      slug
      excerpt
      createdAt
      publishedAt
      cover {
        ...MediaFields
      }
      tags {
        ...TagFields
      }
      technologies {
        ...TechnologyFields
      }
    }
  }
  ${MEDIA_FIELDS}
  ${TAG_FIELDS}
  ${TECHNOLOGY_FIELDS}
`;

const GET_NEWS_BY_SLUG = gql`
  query GetNewsBySlug($slug: String!) {
    newsItems(
      filters: { slug: { eq: $slug } }
      pagination: { limit: 1 }
      status: PUBLISHED
    ) {
      id
      documentId
      title
      slug
      excerpt
      content
      createdAt
      publishedAt
      cover {
        ...MediaFields
      }
      tags {
        ...TagFields
      }
      technologies {
        ...TechnologyFields
      }
      projects {
        id
        documentId
        title
        slug
      }
    }
  }
  ${MEDIA_FIELDS}
  ${TAG_FIELDS}
  ${TECHNOLOGY_FIELDS}
`;

// ─── Public API ───────────────────────────────────────────────────────────────

async function gqlQuery<T>(query: ReturnType<typeof gql>, variables?: Record<string, unknown>): Promise<T> {
  const result = await getClient().query<T>({ query, variables });
  if (!result.data) throw new Error('No data returned from GraphQL');
  return result.data;
}

export async function getTechnologies(): Promise<Technology[]> {
  const data = await gqlQuery<{ technologies: Technology[] }>(GET_TECHNOLOGIES);
  return data.technologies ?? [];
}

export async function getWorkExperiences(): Promise<WorkExperience[]> {
  const data = await gqlQuery<{ workExperiences: WorkExperience[] }>(GET_WORK_EXPERIENCES);
  return data.workExperiences ?? [];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const data = await gqlQuery<{ projects: Project[] }>(GET_FEATURED_PROJECTS);
  return data.projects ?? [];
}

export async function getAllProjects(): Promise<Project[]> {
  const data = await gqlQuery<{ projects: Project[] }>(GET_ALL_PROJECTS);
  return data.projects ?? [];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const data = await gqlQuery<{ projects: Project[] }>(GET_PROJECT_BY_SLUG, { slug });
  return data.projects?.[0] ?? null;
}

export async function getArticles(limit = 10): Promise<Article[]> {
  const data = await gqlQuery<{ articles: Article[] }>(GET_ARTICLES, { limit });
  return data.articles ?? [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const data = await gqlQuery<{ articles: Article[] }>(GET_ARTICLE_BY_SLUG, { slug });
  return data.articles?.[0] ?? null;
}

export async function getNewsItems(limit = 10): Promise<NewsItem[]> {
  const data = await gqlQuery<{ newsItems: NewsItem[] }>(GET_NEWS_ITEMS, { limit });
  return data.newsItems ?? [];
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const data = await gqlQuery<{ newsItems: NewsItem[] }>(GET_NEWS_BY_SLUG, { slug });
  return data.newsItems?.[0] ?? null;
}

