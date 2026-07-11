import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProjects, getProjectBySlug, mediaUrl } from '@/lib/strapi';
import ProjectCaseStudy from '@/components/projects/ProjectCaseStudy';
import { absoluteUrl, projectJsonLd } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getNormalizedShortDescription(shortDescription: string | null) {
  return shortDescription?.trim() || undefined;
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

  const shortDescription = getNormalizedShortDescription(project.shortDescription);

  return {
    title: `${project.title} — инженерный кейс`,
    description: shortDescription ?? `Кейс проекта ${project.title}: контекст, решение, стек и результаты реализации.`,
    alternates: { canonical: absoluteUrl(`/projects/${project.slug}`) },
    openGraph: {
      type: 'website',
      url: absoluteUrl(`/projects/${project.slug}`),
      title: project.title,
      description: shortDescription ?? `Кейс проекта ${project.title}: контекст, решение, стек и результаты реализации.`,
      images: project.cover ? [{ url: project.cover.url }] : [],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const shortDescription = getNormalizedShortDescription(project.shortDescription);
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
          {shortDescription && (
            <p className="text-[#94a3b8] text-lg">{shortDescription}</p>
          )}
        </div>
      </div>

      <ProjectCaseStudy project={project} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(project)) }}
      />
    </main>
  );
}
