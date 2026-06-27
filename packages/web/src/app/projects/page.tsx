import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getAllProjects } from '@/lib/strapi';
import type { Tag, Technology } from '@/lib/strapi-types';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Проекты',
  description: 'Все проекты Павла Кондратова',
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

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  const allTags: Tag[] = uniqueBy(
    projects.flatMap((p) => p.tags),
    'documentId',
  );
  const allTechs: Technology[] = uniqueBy(
    projects.flatMap((p) => p.technologies),
    'documentId',
  );

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <Link
            href="/#projects"
            className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2 hover:text-[#06b6d4] transition-colors flex items-center gap-2"
          >
            ← На главную
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mt-4">Все проекты</h1>
        </div>

        <Suspense fallback={<div className="text-[#94a3b8]">Загрузка...</div>}>
          <ProjectsClient projects={projects} allTags={allTags} allTechs={allTechs} />
        </Suspense>
      </div>
    </main>
  );
}
