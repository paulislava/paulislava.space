'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Technology, Tag } from '@/lib/strapi-types';

interface SkillsProps {
  technologies: Technology[];
  tags: Tag[];
}

export default function Skills({ technologies, tags }: SkillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile || !containerRef.current) return;

    const items = [
      ...technologies.map((t) => ({ type: 'tech', slug: t.slug, name: t.name, color: '#6366f1' })),
      ...tags.map((t) => ({ type: 'tag', slug: t.slug, name: t.name, color: t.color ?? '#94a3b8' })),
    ];

    const container = containerRef.current;
    // Constrain radius by both width and height to prevent clipping
    const radius = Math.min(
      520,
      Math.floor(container.offsetWidth * 0.42),
      Math.floor(container.offsetHeight * 0.42),
    );
    const fontSize = radius < 200 ? '12px' : radius < 350 ? '14px' : '16px';

    let cloudInstance: { destroy(): void } | undefined;

    import('TagCloud').then(({ default: TagCloud }) => {
      if (!containerRef.current) return;

      cloudInstance = TagCloud(containerRef.current, items.map((i) => i.name), {
        radius,
        maxSpeed: 'fast',
        initSpeed: 'fast',
        direction: 135,
        keep: true,
      });

      containerRef.current.querySelectorAll<HTMLElement>('.tagcloud--item').forEach((span, i) => {
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
      const { itemType, itemSlug } = span.dataset;
      if (itemType && itemSlug) router.push(`/projects?${itemType}=${itemSlug}`);
    };

    container.addEventListener('click', handleClick as EventListener);
    return () => {
      container.removeEventListener('click', handleClick as EventListener);
      cloudInstance?.destroy();
    };
  }, [technologies, tags, router, isMobile]);

  const allItems = [
    ...technologies.map((t) => ({ type: 'tech', slug: t.slug, name: t.name, color: '#6366f1' })),
    ...tags.map((t) => ({ type: 'tag', slug: t.slug, name: t.name, color: t.color ?? '#94a3b8' })),
  ];

  return (
    <section id="skills" className="py-16 text-center">
      <div className="mb-8 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Технологии</h2>
      </div>

      {isMobile ? (
        <div className="flex flex-wrap gap-2 justify-center px-6">
          {allItems.map((item) => (
            <button
              key={`${item.type}-${item.slug}`}
              onClick={() => router.push(`/projects?${item.type}=${item.slug}`)}
              className="px-3 py-1.5 text-xs rounded-lg border border-white/10 glass hover:border-[#6366f1]/40 transition-all"
              style={{ color: item.color }}
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : (
        /* display:block overrides TagCloud's injected display:inline-block */
        <div
          ref={containerRef}
          className="relative w-full"
          style={{ height: '80vh', display: 'block' }}
        />
      )}
    </section>
  );
}
