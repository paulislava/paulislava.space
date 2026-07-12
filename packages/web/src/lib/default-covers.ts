export const DEFAULT_PROJECT_COVER = 'https://cdn.paulislava.space/project_default_cover_f2a092e620.png';
export const DEFAULT_ARTICLE_COVER = 'https://cdn.paulislava.space/article_default_cover_6b88526408.png';
export const DEFAULT_NEWS_COVER = 'https://cdn.paulislava.space/news_default_cover_e9289eb87f.png';

export function getDefaultArticleCover(type: 'article' | 'news') {
  return type === 'article' ? DEFAULT_ARTICLE_COVER : DEFAULT_NEWS_COVER;
}
