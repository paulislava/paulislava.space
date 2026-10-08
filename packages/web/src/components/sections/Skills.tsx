'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Technology, Tag } from '@/lib/strapi-types';

interface SkillsProps {
  technologies: Technology[];
  tags: Tag[];
  appearance?: 'dark' | 'light';
}

export default function Skills({ technologies, tags, appearance = 'dark' }: SkillsProps) {
  const light = appearance === 'light';
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const check = () => setIsMobile(window.innerWidth < 640 || reduced.matches);
    reduced.addEventListener('change', check);
    check();
    window.addEventListener('resize', check);
    return () => { window.removeEventListener('resize', check); reduced.removeEventListener('change', check); };
  }, []);

  useEffect(() => {
    if (isMobile || !containerRef.current) return;

    const items = [
      ...technologies.map((t) => ({ type: 'tech', slug: t.slug, name: t.name, color: light ? '#0066cc' : '#6366f1' })),
      ...tags.map((t) => ({ type: 'tag', slug: t.slug, name: t.name, color: light ? '#515154' : t.color ?? '#94a3b8' })),
    ];

    const container = containerRef.current;
    // Constrain radius by both width and height to prevent clipping
    const radius = Math.min(
      720,
      Math.floor(container.offsetWidth * 0.62),
      Math.floor(container.offsetHeight * 0.62),
    );
    const fontSize = radius < 200 ? '12px' : radius < 350 ? '14px' : '16px';

    let active = true;
    let cloudInstance: { destroy(): void; pause(): void; resume(): void } | undefined;
    let visible = false;
    const sync = () => { if (visible && !document.hidden) cloudInstance?.resume(); else cloudInstance?.pause(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(container);
    document.addEventListener('visibilitychange', sync);

    import('TagCloud').then(({ default: TagCloud }) => {
      if (!active || !containerRef.current) return;

      cloudInstance = TagCloud(containerRef.current, items.map((i) => i.name), {
        radius,
        maxSpeed: light ? 'normal' : 'fast',
        initSpeed: light ? 'slow' : 'fast',
        direction: 135,
        keep: true,
      });

      sync();
      containerRef.current.querySelectorAll<HTMLElement>('.tagcloud--item').forEach((span, i) => {
        const item = items[i];
        if (!item) return;
        span.dataset.itemType = item.type;
        span.dataset.itemSlug = item.slug;
        span.style.color = item.color;
        span.style.cursor = 'pointer';
        span.tabIndex = 0;
        span.setAttribute('role', 'link');
        span.setAttribute('aria-label', `Проекты: ${item.name}`);
        span.style.fontSize = fontSize;
        span.style.fontFamily = 'var(--font-geist-sans), sans-serif';
      });
    });

    const handleClick = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) { if (e.key !== 'Enter' && e.key !== ' ') return; e.preventDefault(); }
      const span = (e.target as HTMLElement).closest<HTMLElement>('.tagcloud--item');
      if (!span) return;
      const { itemType, itemSlug } = span.dataset;
      if (itemType && itemSlug) router.push(`/projects?${itemType}=${itemSlug}`);
    };

    container.addEventListener('click', handleClick as EventListener);
    container.addEventListener('keydown', handleClick as EventListener);
    return () => {
      active = false;
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      container.removeEventListener('keydown', handleClick as EventListener);
      container.removeEventListener('click', handleClick as EventListener);
      cloudInstance?.destroy();
    };
  }, [technologies, tags, router, isMobile, light]);

  const allItems = [
    ...technologies.map((t) => ({ type: 'tech', slug: t.slug, name: t.name, color: light ? '#0066cc' : '#6366f1' })),
    ...tags.map((t) => ({ type: 'tag', slug: t.slug, name: t.name, color: light ? '#515154' : t.color ?? '#94a3b8' })),
  ];

  return (
    <section id="skills" className={light ? 'py-16 text-center bg-white text-[#1d1d1f]' : 'py-16 text-center'}>
      <div className="mb-8 px-6">
        <h2 className={light ? 'text-4xl md:text-6xl font-semibold tracking-tight text-[#1d1d1f]' : 'text-3xl md:text-4xl font-bold text-[#f1f5f9]'}>Технологии</h2>
      </div>

      {isMobile ? (
        <div className="flex flex-wrap gap-2 justify-center px-6">
          {allItems.map((item) => (
            <button
              key={`${item.type}-${item.slug}`}
              onClick={() => router.push(`/projects?${item.type}=${item.slug}`)}
              className={light ? 'px-3 py-2 text-sm rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed]' : 'px-3 py-1.5 text-xs rounded-lg border border-white/10 glass hover:border-[#6366f1]/40 transition-all'}
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
          style={{
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      )}
    </section>
  );
}
