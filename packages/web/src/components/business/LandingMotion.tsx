'use client';

import type { ProgressEvent } from 'scrollmagic';
import { useEffect, useRef, type ReactNode } from 'react';

export default function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const query = window.matchMedia('(min-width: 900px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)');
    let disposed = false;
    let generation = 0;
    let destroy = () => {};
    async function setup() {
      const current = ++generation;
      destroy();
      if (!query.matches) return;
      try {
        const scrollMagicModule = await import('scrollmagic');
        if (disposed || current !== generation) return;
        const ScrollMagic = scrollMagicModule.default;
        const controller = new ScrollMagic.Controller({ refreshInterval: 0 });
        const story = element!.querySelector<HTMLElement>('[data-story]');
        const hero = element!.querySelector<HTMLElement>('[data-hero]');
        const panels = Array.from(element!.querySelectorAll<HTMLElement>('[data-story-panel]'));
        const dots = Array.from(element!.querySelectorAll<HTMLElement>('[data-story-dot]'));
        panels.forEach((panel, index) => {
          panel.dataset.active = String(index === 0);
          panel.inert = index !== 0;
          panel.setAttribute('aria-hidden', String(index !== 0));
        });
        element!.dataset.enhanced = 'true';
        if (hero) new ScrollMagic.Scene({ triggerElement: hero, triggerHook: 0, duration: () => hero.offsetHeight })
          .on('progress', (event: ProgressEvent) => hero.style.setProperty('--progress', String(event.progress)))
          .addTo(controller);
        if (story) new ScrollMagic.Scene({ triggerElement: story, triggerHook: 0, offset: -64, duration: () => Math.max(1, story.offsetHeight - window.innerHeight + 64) })
          .on('progress', (event: ProgressEvent) => {
            const active = Math.min(panels.length - 1, Math.floor(event.progress * panels.length));
            const local = event.progress * panels.length - active;
            panels.forEach((panel, index) => {
              panel.dataset.active = String(index === active);
              panel.inert = index !== active;
              panel.setAttribute('aria-hidden', String(index !== active));
              panel.style.setProperty('--travel', String(index === active ? Math.min(local * 1.4, 1) : 0));
            });
            dots.forEach((dot, index) => dot.dataset.active = String(index === active));
          }).addTo(controller);
        controller.update(true);
        destroy = () => {
          controller.destroy(true);
          delete element!.dataset.enhanced;
          hero?.style.removeProperty('--progress');
          panels.forEach((panel) => { delete panel.dataset.active; panel.inert = false; panel.removeAttribute('aria-hidden'); panel.style.removeProperty('--travel'); });
        };
      } catch {
        delete element!.dataset.enhanced;
      }
    }
    void setup();
    query.addEventListener('change', setup);
    return () => { disposed = true; generation++; query.removeEventListener('change', setup); destroy(); };
  }, []);
  return <div ref={root}>{children}</div>;
}
