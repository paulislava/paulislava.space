'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getYearsOfExperience } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: getYearsOfExperience(2011), label: 'лет опыта', suffix: '' },
  { value: 9, label: 'проектов', suffix: '' },
  { value: 4, label: 'хакатона', suffix: '' },
  { value: 5, label: 'конференций', suffix: '' },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });
  }, [value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll('.fade-in'), {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
    });
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="fade-in mb-12">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Обо мне</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Кто я такой</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="fade-in space-y-4 text-[#94a3b8] leading-relaxed">
            <p>
              Software Engineer с 15 годами опыта. Строю fullstack-продукты — от Telegram Mini App до внутренних корпоративных сервисов.
            </p>
            <p>
              Умею проектировать архитектуру, настраивать CI/CD, писать код и объяснять технические решения команде. Работал в SberDevices, Бруснике, стартапах и УрФУ.
            </p>
            <p>
              Люблю чистый код, автоматизацию и инструменты, которые экономят время и деньги заказчика.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://github.com/paulislava"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6366f1] hover:text-[#06b6d4] transition-colors text-sm font-mono"
              >
                GitHub →
              </a>
              <a
                href="mailto:i@paulislava.space"
                className="text-[#6366f1] hover:text-[#06b6d4] transition-colors text-sm font-mono"
              >
                Email →
              </a>
            </div>
          </div>

          <div className="fade-in grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center">
                <p className="text-4xl font-bold gradient-text mb-1">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-[#94a3b8] text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
