'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WorkExperience, mediaUrl } from '@/lib/strapi-types';
import { formatDateRange } from '@/lib/utils';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

interface ExperienceProps {
  workExperiences: WorkExperience[];
}

export default function Experience({ workExperiences }: ExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const items = sectionRef.current.querySelectorAll('.exp-item');
    items.forEach((item) => {
      gsap.from(item, {
        x: -30, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 80%', once: true },
      });
    });
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="py-24 px-6 bg-[#12121a]/50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Опыт</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Где работал</h2>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#6366f1] via-[#06b6d4] to-transparent" />

          <div className="space-y-8 pl-12">
            {workExperiences.map((exp) => {
              const logo = mediaUrl(exp.logo, 'thumbnail') ?? mediaUrl(exp.logo);
              return (
                <div key={exp.id} className="exp-item relative">
                  <div className="absolute -left-10 top-6 w-4 h-4 rounded-full bg-[#6366f1] border-2 border-[#0a0a0f]" />

                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-start gap-3 mb-3">
                      {logo && (
                        <Image
                          src={logo}
                          alt={exp.company}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1 flex-shrink-0"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-[#f1f5f9] text-base">{exp.title}</h3>
                        <div className="flex items-center gap-2">
                          {exp.companyUrl ? (
                            <a
                              href={exp.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6366f1] text-sm hover:text-[#06b6d4] transition-colors"
                            >
                              {exp.company}
                            </a>
                          ) : (
                            <span className="text-[#6366f1] text-sm">{exp.company}</span>
                          )}
                          {exp.isRemote && (
                            <span className="text-xs text-[#94a3b8] bg-white/5 rounded px-1.5 py-0.5">
                              Remote
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#94a3b8] font-mono mb-3">
                      {formatDateRange(exp.startDate, exp.endDate)}
                      {exp.location && ` · ${exp.location}`}
                    </p>

                    {exp.description?.length > 0 && (
                      <p className="text-[#94a3b8] text-sm leading-relaxed">
                        {exp.description[0]?.children?.[0]?.text ?? ''}
                      </p>
                    )}

                    {exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {exp.technologies.slice(0, 6).map((tech) => (
                          <span
                            key={tech.id}
                            className="text-xs text-[#06b6d4] bg-[#06b6d4]/10 rounded px-1.5 py-0.5"
                          >
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
