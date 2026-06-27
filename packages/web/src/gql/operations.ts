/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Enum_Tag_Category =
  | 'article'
  | 'news'
  | 'project';

export type Enum_Technology_Category =
  | 'Backend'
  | 'Database'
  | 'DevOps'
  | 'Frontend'
  | 'Other';

export type ArticleCardFieldsFragment = { documentId: string, title: string, slug: string, excerpt: string | null, createdAt: string | null, publishedAt: string | null, cover: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, tags: Array<{ documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category } | null>, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null> };

export type GetArticlesQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type GetArticlesQuery = { articles: Array<{ documentId: string, title: string, slug: string, excerpt: string | null, createdAt: string | null, publishedAt: string | null, cover: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, tags: Array<{ documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category } | null>, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null> } | null> };

export type GetArticleBySlugQueryVariables = Exact<{
  slug: string;
}>;


export type GetArticleBySlugQuery = { articles: Array<{ content: Record<string, unknown> | null, documentId: string, title: string, slug: string, excerpt: string | null, createdAt: string | null, publishedAt: string | null, cover: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, tags: Array<{ documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category } | null>, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null> } | null> };

export type MediaFieldsFragment = { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null };

export type TechnologyFieldsFragment = { documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null };

export type TagFieldsFragment = { documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category };

export type NewsCardFieldsFragment = { documentId: string, title: string, slug: string, excerpt: string | null, createdAt: string | null, publishedAt: string | null, cover: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, tags: Array<{ documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category } | null>, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null> };

export type GetNewsItemsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type GetNewsItemsQuery = { news_items: Array<{ documentId: string, title: string, slug: string, excerpt: string | null, createdAt: string | null, publishedAt: string | null, cover: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, tags: Array<{ documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category } | null>, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null> } | null> };

export type GetNewsBySlugQueryVariables = Exact<{
  slug: string;
}>;


export type GetNewsBySlugQuery = { news_items: Array<{ content: Record<string, unknown> | null, documentId: string, title: string, slug: string, excerpt: string | null, createdAt: string | null, publishedAt: string | null, projects: Array<{ documentId: string, title: string, slug: string } | null>, cover: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, tags: Array<{ documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category } | null>, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null> } | null> };

export type ProjectCardFieldsFragment = { documentId: string, title: string, slug: string, shortDescription: string | null, url: string | null, githubUrl: string | null, featured: boolean | null, cover: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null>, tags: Array<{ documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category } | null> };

export type GetFeaturedProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFeaturedProjectsQuery = { projects: Array<{ documentId: string, title: string, slug: string, shortDescription: string | null, url: string | null, githubUrl: string | null, featured: boolean | null, screenshots: Array<{ documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null>, cover: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null>, tags: Array<{ documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category } | null> } | null> };

export type GetAllProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllProjectsQuery = { projects: Array<{ documentId: string, title: string, slug: string, shortDescription: string | null, url: string | null, githubUrl: string | null, featured: boolean | null, cover: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null>, tags: Array<{ documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category } | null> } | null> };

export type GetProjectBySlugQueryVariables = Exact<{
  slug: string;
}>;


export type GetProjectBySlugQuery = { projects: Array<{ description: Record<string, unknown> | null, documentId: string, title: string, slug: string, shortDescription: string | null, url: string | null, githubUrl: string | null, featured: boolean | null, screenshots: Array<{ documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null>, cover: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null>, tags: Array<{ documentId: string, name: string, slug: string, color: string | null, category: Enum_Tag_Category } | null> } | null> };

export type GetTechnologiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTechnologiesQuery = { technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null> };

export type GetWorkExperiencesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkExperiencesQuery = { workExperiences: Array<{ documentId: string, title: string, company: string, companyUrl: string | null, startDate: unknown, endDate: unknown, description: Record<string, unknown> | null, isRemote: boolean | null, location: string | null, logo: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null, technologies: Array<{ documentId: string, name: string, slug: string, category: Enum_Technology_Category, websiteUrl: string | null, icon: { documentId: string, url: string, alternativeText: string | null, width: number | null, height: number | null, formats: Record<string, unknown> | null } | null } | null> } | null> };
