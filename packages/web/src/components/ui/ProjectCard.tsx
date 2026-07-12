import Image from 'next/image';
import Link from 'next/link';
import { Project, mediaUrl } from '@/lib/strapi-types';
import Tag from './Tag';
import { DEFAULT_PROJECT_COVER } from '@/lib/default-covers';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const cover = mediaUrl(project.cover, 'medium') ?? mediaUrl(project.cover) ?? DEFAULT_PROJECT_COVER;
  return (
    <Link href={`/projects/${project.slug}`} className="group block break-inside-avoid mb-4">
      <div className="glass rounded-2xl overflow-hidden hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-48 bg-[#12121a]">
          <Image
            src={cover}
            alt={project.title}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 to-transparent" />
        </div>
        <div className="p-5">
          <h3 className="font-bold text-[#f1f5f9] text-lg mb-1 group-hover:text-[#6366f1] transition-colors">
            {project.title}
          </h3>
          {project.shortDescription && (
            <p className="text-[#94a3b8] text-sm mb-3 line-clamp-2">{project.shortDescription}</p>
          )}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {project.tags.slice(0, 3).map((tag) => <Tag key={tag.documentId} tag={tag} />)}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((tech) => (
              <span key={tech.documentId} className="text-xs text-[#6366f1] bg-[#6366f1]/10 rounded px-1.5 py-0.5">
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
