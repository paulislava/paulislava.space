import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProjects, mediaUrl } from '@/lib/strapi';
import Tag from '@/components/ui/Tag';

export const metadata: Metadata = {
  title: 'Проекты',
  description: 'Все проекты Павла Кондратова',
};

export default async function ProjectsPage() {
  const projects = await getAllProjects().catch(() => []);

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

        {projects.length === 0 ? (
          <p className="text-[#94a3b8] text-center py-24">Проекты скоро появятся</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const cover = mediaUrl(project.cover, 'medium') ?? mediaUrl(project.cover);
              return (
                <Link
                  key={project.documentId}
                  href={`/projects/${project.slug}`}
                  className="glass rounded-2xl overflow-hidden group hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
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
                          <Tag key={tag.documentId} tag={tag} />
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
