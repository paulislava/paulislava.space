'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Technology, mediaUrl } from '@/lib/strapi-types';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

interface SkillsProps {
  technologies: Technology[];
}

const CATEGORY_ORDER: Technology['category'][] = ['Frontend', 'Backend', 'Database', 'DevOps', 'Other'];
const CATEGORY_COLORS: Record<string, string> = {
  Frontend: '#6366f1',
  Backend: '#10b981',
  Database: '#f59e0b',
  DevOps: '#06b6d4',
  Other: '#94a3b8',
};

export default function Skills({ technologies }: SkillsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const grouped = CATEGORY_ORDER.reduce<Record<string, Technology[]>>((acc, cat) => {
    acc[cat] = technologies.filter((t) => t.category === cat);
    return acc;
  }, {});

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll('.skill-badge'), {
      scale: 0.8, opacity: 0, duration: 0.4, stagger: 0.03, ease: 'back.out(1.5)',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
    });
  }, []);

  return (
    <section id="skills" ref={sectionRef} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Навыки</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Технологии</h2>
        </div>

        <div className="space-y-8">
          {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map((cat) => (
            <div key={cat}>
              <h3
                className="text-sm font-mono uppercase tracking-widest mb-3"
                style={{ color: CATEGORY_COLORS[cat] }}
              >
                {cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {grouped[cat].map((tech) => {
                  const icon = mediaUrl(tech.icon);
                  return (
                    <div
                      key={tech.documentId}
                      className="skill-badge glass rounded-xl px-3 py-2 flex items-center gap-2 hover:border-[#6366f1]/40 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
                    >
                      {icon && (
                        <Image
                          src={icon}
                          alt={tech.name}
                          width={18}
                          height={18}
                          className="w-4 h-4 object-contain"
                        />
                      )}
                      <span className="text-sm text-[#f1f5f9]">{tech.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
