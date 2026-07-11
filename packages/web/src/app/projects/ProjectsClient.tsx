'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Project, Tag, Technology, mediaUrl } from '@/lib/strapi-types';
import TagComponent from '@/components/ui/Tag';

interface Props {
  projects: Project[];
  allTags: Tag[];
  allTechs: Technology[];
}

export default function ProjectsClient({ projects, allTags, allTechs }: Props) {
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
      router.push(qs ? `/projects?${qs}` : '/projects');
    },
    [router, searchParams],
  );

  const filtered = projects.filter((p) => {
    if (activeTag && !p.tags.some((t) => t.slug === activeTag)) return false;
    if (activeTech && !p.technologies.some((t) => t.slug === activeTech)) return false;
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
                  color: activeTag === tag.slug ? '#fff' : tag.color,
                  background: activeTag === tag.slug ? tag.color : `${tag.color}20`,
                  border: `1px solid ${tag.color}${activeTag === tag.slug ? '' : '40'}`,
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
        <p className="text-[#94a3b8] text-center py-24">Нет проектов с таким фильтром</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {filtered.map((project) => {
            const cover = mediaUrl(project.cover, 'medium') ?? mediaUrl(project.cover);
            return (
              <Link
                key={project.documentId}
                href={`/projects/${project.slug}`}
                className="glass rounded-2xl overflow-hidden group hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col break-inside-avoid mb-6"
              >
                {cover && (
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={cover}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-bold text-[#f1f5f9] text-lg mb-2 group-hover:text-[#6366f1] transition-colors">
                    {project.title}
                  </h2>
                  {project.shortDescription && (
                    <p className="text-[#94a3b8] text-sm leading-relaxed mb-4 flex-1">
                      {project.shortDescription}
                    </p>
                  )}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
                      {project.tags.slice(0, 4).map((tag) => (
                        <TagComponent key={tag.documentId} tag={tag} />
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
