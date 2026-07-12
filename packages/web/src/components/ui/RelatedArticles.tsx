import Link from 'next/link';
import Image from 'next/image';
import { ArticleCard, mediaUrl } from '@/lib/strapi-types';
import Tag from './Tag';
import { formatDate } from '@/lib/utils';
import { DEFAULT_ARTICLE_COVER } from '@/lib/default-covers';

interface RelatedArticlesProps {
  articles: ArticleCard[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-white/5">
      <h2 className="text-2xl font-bold text-[#f1f5f9] mb-6 font-mono">
        <span className="text-[#6366f1]">#</span> Похожие статьи
      </h2>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {articles.map((article) => {
          const cover = mediaUrl(article.cover, 'medium') ?? mediaUrl(article.cover) ?? DEFAULT_ARTICLE_COVER;
          return (
            <Link
              key={article.documentId}
              href={`/articles/${article.slug}`}
              className="group block break-inside-avoid mb-4"
            >
              <div className="glass rounded-2xl overflow-hidden hover:border-[#06b6d4]/40 transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-32 bg-[#12121a]">
                  <Image
                    src={cover}
                    alt={article.title}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 to-transparent" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#94a3b8] mb-1">{formatDate(article.publishedAt ?? article.createdAt)}</p>
                  <h3 className="font-semibold text-[#f1f5f9] text-sm mb-2 line-clamp-2 group-hover:text-[#06b6d4] transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-[#94a3b8] text-xs line-clamp-2 mb-2">{article.excerpt}</p>
                  )}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 2).map((tag) => (
                        <Tag key={tag.documentId} tag={tag} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
