import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProjects, getProjectBySlug, mediaUrl } from '@/lib/strapi';
import RichText from '@/components/ui/RichText';
import Tag from '@/components/ui/Tag';
import ProjectScreenshots from './ProjectScreenshots';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const projects = await getAllProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.shortDescription ?? undefined,
    openGraph: {
      images: project.cover ? [{ url: project.cover.url }] : [],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const cover = mediaUrl(project.cover, 'large') ?? mediaUrl(project.cover);

  return (
    <main className="min-h-screen pt-20">
      <div className="relative h-[50vh] min-h-[320px]">
        {cover ? (
          <Image src={cover} alt={project.title} fill className="object-cover opacity-50" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-[#06b6d4]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 px-6 max-w-4xl mx-auto">
          <Link href="/#projects" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors mb-3 block font-mono">
            ← Назад к проектам
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mb-3">{project.title}</h1>
          {project.shortDescription && (
            <p className="text-[#94a3b8] text-lg">{project.shortDescription}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-4 items-center mb-10">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#4f46e5] transition-colors"
            >
              Открыть сайт →
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl glass text-[#f1f5f9] text-sm font-semibold hover:border-[#6366f1]/40 transition-colors"
            >
              GitHub →
            </a>
          )}
          {project.tags.map((tag) => <Tag key={tag.id} tag={tag} size="md" />)}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {project.description?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#f1f5f9] mb-4">О проекте</h2>
                <RichText blocks={project.description} />
              </div>
            )}

            {project.screenshots?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#f1f5f9] mb-4">Скриншоты</h2>
                <ProjectScreenshots screenshots={project.screenshots} />
              </div>
            )}
          </div>

          <div>
            <div className="glass rounded-2xl p-5 sticky top-24">
              <h3 className="text-sm font-mono uppercase tracking-widest text-[#6366f1] mb-4">Стек</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech.id}
                    className="text-xs text-[#f1f5f9] bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
