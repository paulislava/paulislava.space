import ProjectCard from '@/components/ui/ProjectCard';
import type { Project } from '@/lib/strapi-types';

interface RelatedProjectsProps {
  projects: Project[];
}

export default function RelatedProjects({ projects }: RelatedProjectsProps) {
  if (!projects.length) return null;

  return (
    <section className="mt-16 pt-12 border-t border-white/5">
      <h2 className="text-2xl font-bold text-[#f1f5f9] mb-3 font-mono">
        <span className="text-[#6366f1]">#</span> Где это применено на практике
      </h2>
      <p className="text-[#94a3b8] text-sm leading-6 mb-6 max-w-2xl">
        Проекты ниже связаны с этой статьёй по общим темам, технологиям или предметной области.
        Они показывают, где эти идеи использовались в реальной инженерной работе.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.documentId} project={project} />
        ))}
      </div>
    </section>
  );
}
