'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Article, Tag, Technology, mediaUrl } from '@/lib/strapi-types';
import { formatDate } from '@/lib/utils';

interface Props {
  articles: Article[];
  allTags: Tag[];
  allTechs: Technology[];
}

export default function ArticlesClient({ articles, allTags, allTechs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTag = searchParams.get('tag');
  const activeTech = searchParams.get('tech');

  const setFilter = useCallback(
    (key: 'tag' | 'tech', slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set(key, slug);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      router.push(qs ? `/articles?${qs}` : '/articles');
    },
    [router, searchParams],
  );

  const filtered = articles.filter((a) => {
    if (activeTag && !a.tags.some((t) => t.slug === activeTag)) return false;
    if (activeTech && !a.technologies.some((t) => t.slug === activeTech)) return false;
    return true;
  });

  return (
    <>
      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-mono text-[#94a3b8] uppercase tracking-widest mb-2">Теги</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('tag', null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                !activeTag
                  ? 'bg-[#6366f1] text-white'
                  : 'glass text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              Все
            </button>
            {allTags.map((tag) => (
              <button
                key={tag.documentId}
                onClick={() => setFilter('tag', activeTag === tag.slug ? null : tag.slug)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  color: activeTag === tag.slug ? '#fff' : tag.color ?? '#6366f1',
                  background:
                    activeTag === tag.slug
                      ? (tag.color ?? '#6366f1')
                      : `${tag.color ?? '#6366f1'}20`,
                  border: `1px solid ${tag.color ?? '#6366f1'}${activeTag === tag.slug ? '' : '40'}`,
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Technology filters */}
      {allTechs.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-mono text-[#94a3b8] uppercase tracking-widest mb-2">
            Технологии
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('tech', null)}
              className={`px-3 py-1 text-xs rounded-lg transition-all border ${
                !activeTech
                  ? 'bg-[#6366f1] border-[#6366f1] text-white'
                  : 'glass border-white/10 text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              Все
            </button>
            {allTechs.map((tech) => (
              <button
                key={tech.documentId}
                onClick={() => setFilter('tech', activeTech === tech.slug ? null : tech.slug)}
                className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                  activeTech === tech.slug
                    ? 'bg-[#6366f1] border-[#6366f1] text-white'
                    : 'glass border-white/10 text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#6366f1]/40'
                }`}
              >
                {tech.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-[#94a3b8] text-center py-24">Нет статей с таким фильтром</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {filtered.map((article) => {
            const cover = mediaUrl(article.cover, 'medium') ?? mediaUrl(article.cover);
            return (
              <Link
                key={article.documentId}
                href={`/articles/${article.slug}`}
                className="glass rounded-2xl overflow-hidden group hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col break-inside-avoid mb-6"
              >
                {cover ? (
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={cover}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                ) : (
                  <div className="h-1.5 bg-gradient-to-r from-[#6366f1] to-[#06b6d4]" />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[#6366f1] font-mono text-xs mb-2">
                    {formatDate(article.publishedAt ?? article.createdAt)}
                  </p>
                  <h2 className="font-bold text-[#f1f5f9] text-lg mb-2 group-hover:text-[#6366f1] transition-colors leading-snug">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-[#94a3b8] text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                  {(article.tags.length > 0 || article.technologies.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.documentId}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            color: tag.color ?? '#6366f1',
                            background: `${tag.color ?? '#6366f1'}20`,
                            border: `1px solid ${tag.color ?? '#6366f1'}40`,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {article.technologies.slice(0, 2).map((tech) => (
                        <span
                          key={tech.documentId}
                          className="text-xs text-[#6366f1] bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg px-2 py-0.5"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
