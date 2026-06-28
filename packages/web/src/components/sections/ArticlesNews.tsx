'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Article, NewsItem } from '@/lib/strapi-types';
import ArticleCard from '@/components/ui/ArticleCard';

interface ArticlesNewsProps {
  articles: Article[];
  news: NewsItem[];
}

export default function ArticlesNews({ articles, news }: ArticlesNewsProps) {
  const [tab, setTab] = useState<'articles' | 'news'>('articles');
  const hasContent = articles.length > 0 || news.length > 0;

  if (!hasContent) return null;

  return (
    <section id="articles" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Контент</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Статьи и новости</h2>
          </div>
          {articles.length > 0 && (
            <Link
              href="/articles"
              className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors font-mono hidden sm:block"
            >
              Все статьи →
            </Link>
          )}
        </div>

        {articles.length > 0 && news.length > 0 && (
          <div className="flex gap-4 mb-8">
            {(['articles', 'news'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t ? 'bg-[#6366f1] text-white' : 'glass text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
              >
                {t === 'articles' ? `Статьи (${articles.length})` : `Новости (${news.length})`}
              </button>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(articles.length > 0 && (news.length === 0 || tab === 'articles'))
            ? articles.map((a) => <ArticleCard key={a.documentId} item={a} type="article" />)
            : news.map((n) => <ArticleCard key={n.documentId} item={n} type="news" />)}
        </div>
      </div>
    </section>
  );
}
