'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Technology, Tag } from '@/lib/strapi-types';

interface SkillsProps {
  technologies: Technology[];
  tags: Tag[];
}

export default function Skills({ technologies, tags }: SkillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;

    const items = [
      ...technologies.map((t) => ({ type: 'tech', slug: t.slug, name: t.name, color: '#6366f1' })),
      ...tags.map((t) => ({ type: 'tag', slug: t.slug, name: t.name, color: t.color })),
    ];

    const texts = items.map((item) => item.name);
    let cloudInstance: { destroy(): void } | undefined;

    import('TagCloud').then(({ default: TagCloud }) => {
      if (!containerRef.current) return;

      cloudInstance = TagCloud(containerRef.current, texts, {
        radius: 260,
        maxSpeed: 'fast',
        initSpeed: 'fast',
        direction: 135,
        keep: true,
      });

      // Post-process: attach data attributes and colors to generated spans
      const spans = containerRef.current.querySelectorAll<HTMLElement>('.tagcloud--item');
      spans.forEach((span, i) => {
        const item = items[i];
        if (!item) return;
        span.dataset.itemType = item.type;
        span.dataset.itemSlug = item.slug;
        span.style.color = item.color;
        span.style.cursor = 'pointer';
        span.style.fontSize = '14px';
        span.style.fontFamily = 'var(--font-geist-sans), sans-serif';
      });
    });

    const handleClick = (e: MouseEvent) => {
      const span = (e.target as HTMLElement).closest<HTMLElement>('.tagcloud--item');
      if (!span) return;
      const type = span.dataset.itemType;
      const slug = span.dataset.itemSlug;
      if (type && slug) {
        router.push(`/projects?${type}=${slug}`);
      }
    };

    containerRef.current.addEventListener('click', handleClick as EventListener);

    return () => {
      containerRef.current?.removeEventListener('click', handleClick as EventListener);
      cloudInstance?.destroy();
    };
  }, [technologies, tags, router]);

  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Навыки</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Технологии</h2>
        </div>

        <div
          ref={containerRef}
          className="tagcloud relative mx-auto"
          style={{ width: '100%', height: '560px' }}
        />
      </div>
    </section>
  );
}
