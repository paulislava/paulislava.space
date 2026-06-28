import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getAllArticles } from '@/lib/strapi';
import type { Tag, Technology } from '@/lib/strapi-types';
import ArticlesClient from './ArticlesClient';

export const metadata: Metadata = {
  title: 'Статьи',
  description: 'Все статьи Павла Кондратова о разработке, архитектуре и технологиях',
};

function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  const allTags: Tag[] = uniqueBy(
    articles.flatMap((a) => a.tags),
    'documentId',
  );
  const allTechs: Technology[] = uniqueBy(
    articles.flatMap((a) => a.technologies),
    'documentId',
  );

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <Link
            href="/#articles"
            className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2 hover:text-[#06b6d4] transition-colors flex items-center gap-2"
          >
            ← На главную
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mt-4">Все статьи</h1>
        </div>

        <Suspense fallback={<div className="text-[#94a3b8]">Загрузка...</div>}>
          <ArticlesClient articles={articles} allTags={allTags} allTechs={allTechs} />
        </Suspense>
      </div>
    </main>
  );
}
