'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const links = [
  { href: '/#about', label: 'Обо мне' },
  { href: '/#experience', label: 'Опыт' },
  { href: '/#skills', label: 'Навыки' },
  { href: '/projects', label: 'Проекты' },
  { href: '/articles', label: 'Статьи' },
  { href: '/series', label: 'Циклы' },
  { href: '/#contact', label: 'Контакт' },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileOpen]);

  const hasBg = scrolled || mobileOpen;

  return (
    <nav
      aria-label="Основная навигация"
      className="fixed px-6 top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: hasBg ? 'rgba(10,10,15,0.9)' : 'transparent',
        backdropFilter: hasBg ? 'blur(12px)' : 'none',
        borderBottom: hasBg ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto py-4 flex items-center justify-between">
        <Link href="/" className="font-mono text-sm font-bold gradient-text">
          Pavel Kondratov | @paulislava
        </Link>

        <ul className="hidden md:flex gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
        >
          <span className={`block w-5 h-px bg-[#f1f5f9] transition-all duration-200 origin-center ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`block w-5 h-px bg-[#f1f5f9] transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-[#f1f5f9] transition-all duration-200 origin-center ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </div>

      {mobileOpen && (
        <ul id="mobile-nav-menu" className="md:hidden pb-4 flex flex-col">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block px-2 py-3 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
