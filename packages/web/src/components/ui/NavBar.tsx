'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/#about', label: 'Обо мне' },
  { href: '/#experience', label: 'Опыт' },
  { href: '/#skills', label: 'Навыки' },
  { href: '/projects', label: 'Проекты' },
  { href: '/articles', label: 'Статьи' },
  { href: '/series', label: 'Циклы' },
  { href: '/#contact', label: 'Контакт' },
  { href: '/zakazat-sait-avtomatizaciyu', label: 'Заказать разработку' },
];

function LeadIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="w-4 h-4"><path d="M4.5 15.5 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function NavBar() {
  const business = usePathname() === '/zakazat-sait-avtomatizaciyu';
  const navLinks = business ? [{ href: '#work', label: 'Работы' }, { href: '#services', label: 'Возможности' }] : links;
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

  function openBusinessLead() {
    setMobileOpen(false);
    window.dispatchEvent(new Event('business-lead-open'));
  }

  return (
    <nav
      aria-label="Основная навигация"
      className="fixed px-6 top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: business ? 'rgba(255,255,255,0.88)' : hasBg ? 'rgba(10,10,15,0.9)' : 'transparent',
        backdropFilter: business || hasBg ? 'blur(12px)' : 'none',
        borderBottom: hasBg ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto py-4 flex items-center justify-between">
        <Link href="/" className={business ? 'text-base font-semibold text-[#1d1d1f] tracking-tight' : 'font-mono text-sm font-bold gradient-text'}>
          {business ? 'Павел Кондратов' : 'Pavel Kondratov | @paulislava'}
        </Link>

        <div className="flex items-center gap-4">
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={business ? 'text-sm text-[#424245] hover:text-[#0066cc] transition-colors' : 'text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200'}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {business && <button type="button" onClick={openBusinessLead} className="hidden md:inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-4 py-2 text-sm font-medium text-white hover:bg-[#0077ed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]">Обсудить проект <LeadIcon /></button>}
          {business && <button type="button" onClick={openBusinessLead} aria-label="Обсудить проект" className="md:hidden grid place-items-center rounded-full bg-[#0071e3] size-9 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"><LeadIcon /></button>}
          <button
            type="button"
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
          >
            <span className={`block w-5 h-px ${business ? 'bg-[#1d1d1f]' : 'bg-[#f1f5f9]'} transition-all duration-200 origin-center ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-5 h-px ${business ? 'bg-[#1d1d1f]' : 'bg-[#f1f5f9]'} transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px ${business ? 'bg-[#1d1d1f]' : 'bg-[#f1f5f9]'} transition-all duration-200 origin-center ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <ul id="mobile-nav-menu" className="md:hidden pb-4 flex flex-col">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={business ? 'block px-2 py-3 text-sm text-[#424245] hover:text-[#0066cc]' : 'block px-2 py-3 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200'}
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
