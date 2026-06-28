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
      ...tags.map((t) => ({ type: 'tag', slug: t.slug, name: t.name, color: t.color ?? '#94a3b8' })),
    ];

    const texts = items.map((item) => item.name);
    let cloudInstance: { destroy(): void } | undefined;
    const container = containerRef.current;

    // Radius scales to 40% of container width, capped at 520px
    const radius = Math.min(520, Math.floor(container.offsetWidth * 0.4));
    const fontSize = radius < 180 ? '11px' : radius < 320 ? '13px' : '15px';

    import('TagCloud').then(({ default: TagCloud }) => {
      if (!containerRef.current) return;

      cloudInstance = TagCloud(containerRef.current, texts, {
        radius,
        maxSpeed: 'fast',
        initSpeed: 'fast',
        direction: 135,
        keep: true,
      });

      const spans = containerRef.current.querySelectorAll<HTMLElement>('.tagcloud--item');
      spans.forEach((span, i) => {
        const item = items[i];
        if (!item) return;
        span.dataset.itemType = item.type;
        span.dataset.itemSlug = item.slug;
        span.style.color = item.color;
        span.style.cursor = 'pointer';
        span.style.fontSize = fontSize;
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

    container.addEventListener('click', handleClick as EventListener);

    return () => {
      container.removeEventListener('click', handleClick as EventListener);
      cloudInstance?.destroy();
    };
  }, [technologies, tags, router]);

  return (
    <section id="skills" className="py-16 text-center overflow-hidden">
      <div className="mb-8 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Технологии</h2>
      </div>

      <div
        ref={containerRef}
        className="tagcloud relative w-full"
        style={{ height: '80vh' }}
      />
    </section>
  );
}
