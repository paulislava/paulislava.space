import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProjects, getProjectBySlug, mediaUrl } from '@/lib/strapi';
import RichText from '@/components/ui/RichText';
import Tag from '@/components/ui/Tag';
import ProjectScreenshots from './ProjectScreenshots';
import { absoluteUrl, projectJsonLd } from '@/lib/seo';

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
    alternates: { canonical: absoluteUrl(`/projects/${project.slug}`) },
    openGraph: {
      type: 'website',
      url: absoluteUrl(`/projects/${project.slug}`),
      title: project.title,
      description: project.shortDescription ?? undefined,
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
    <main>
      <div className="relative">
        {cover ? (
          <Image src={cover} alt={project.title} fill className="object-cover opacity-50" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-[#06b6d4]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-4">
          <Link href="/projects" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors mb-3 block font-mono">
            ← Назад к проектам
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mb-3">{project.title}</h1>
          {project.shortDescription && (
            <p className="text-[#94a3b8] text-lg">{project.shortDescription}</p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-6 pb-12">
        {(project.tags.length > 0 || project.technologies.length > 0) && (
          <div className="flex flex-wrap gap-2 max-w-[500px] mb-4">
            {project.tags.map((tag) => <Tag key={tag.documentId} tag={tag} size="md" />)}
            {project.technologies.map((tech) => (
              <span
                key={tech.documentId}
                className="text-xs text-[#f1f5f9] bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5"
              >
                {tech.name}
              </span>
            ))}
          </div>
        )}
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
        </div>

        <div className="max-w-3xl">
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
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(project)) }}
      />
    </main>
  );
}
