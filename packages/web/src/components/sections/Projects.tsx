'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';
import Image from 'next/image';
import { Project, mediaUrl } from '@/lib/strapi-types';
import Tag from '@/components/ui/Tag';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelector('.section-header'), {
      y: 30, opacity: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
    });
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="py-24 px-6 bg-[#12121a]/50 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="section-header mb-10 flex items-end justify-between">
          <div>
            <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Проекты</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Что я строил</h2>
          </div>
          <Link href="/projects" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors hidden md:block">
            Все проекты →
          </Link>
        </div>

        <Swiper
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1.5 },
            1024: { slidesPerView: 2.5 },
          }}
          className="!overflow-visible"
          style={{ '--swiper-theme-color': '#6366f1', '--swiper-navigation-size': '24px' } as React.CSSProperties}
        >
          {projects.map((project) => {
            const cover = mediaUrl(project.cover, 'medium') ?? mediaUrl(project.cover);
            return (
              <SwiperSlide key={project.id}>
                <Link href={`/projects/${project.slug}`} className="group block">
                  <div className="glass rounded-2xl overflow-hidden hover:border-[#6366f1]/40 transition-all duration-300 pb-2">
                    <div className="relative h-52 bg-[#12121a]">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={project.title}
                          fill
                          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-[#06b6d4]/20 flex items-center justify-center">
                          <span className="text-5xl font-bold gradient-text opacity-30">{project.title[0]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#f1f5f9] mb-1 group-hover:text-[#6366f1] transition-colors">
                        {project.title}
                      </h3>
                      {project.shortDescription && (
                        <p className="text-[#94a3b8] text-sm mb-3 line-clamp-2">{project.shortDescription}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.tags.slice(0, 3).map((tag) => <Tag key={tag.id} tag={tag} />)}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 5).map((tech) => (
                          <span key={tech.id} className="text-xs text-[#6366f1] bg-[#6366f1]/10 rounded px-1.5 py-0.5">
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="mt-8 text-center md:hidden">
          <Link href="/projects" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors">
            Все проекты →
          </Link>
        </div>
      </div>
    </section>
  );
}
