'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const ROLES = ['Software Engineer', 'Tech Lead', 'Full-Stack Developer', 'DevOps Engineer'];

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const role = ROLES[roleIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < role.length) {
      timeout = setTimeout(() => setDisplayed(role.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === role.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, roleIndex]);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    if (headingRef.current) tl.from(headingRef.current, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' });
    if (subtitleRef.current) tl.from(subtitleRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
    if (ctaRef.current) tl.from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#06b6d4]/10 rounded-full blur-[120px]" />
      </div>

      <ParticleCanvas />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-[#6366f1] font-mono text-sm mb-4 tracking-widest uppercase">Привет, я</p>

        <h1 ref={headingRef} className="text-5xl md:text-7xl font-bold text-[#f1f5f9] mb-4 leading-tight">
          Paul{' '}
          <span className="gradient-text">Kondratov</span>
        </h1>

        <p ref={subtitleRef} className="text-xl md:text-2xl text-[#94a3b8] mb-8 h-8">
          <span className="text-[#06b6d4]">{displayed}</span>
          <span className="animate-pulse">|</span>
        </p>

        <p className="text-[#94a3b8] text-base max-w-xl mx-auto mb-10">
          6+ лет в разработке — от стартапов до продуктов SberDevices.
          Строю масштабируемые веб-приложения и DevOps-пайплайны.
        </p>

        <div ref={ctaRef} className="flex gap-4 justify-center flex-wrap">
          <a
            href="#projects"
            className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#6366f1] text-white hover:bg-[#4f46e5] transition-colors duration-200"
          >
            Проекты
          </a>
          <a
            href="#contact"
            className="px-6 py-3 rounded-xl font-semibold text-sm glass text-[#f1f5f9] hover:border-[#6366f1]/50 transition-colors duration-200"
          >
            Связаться
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs text-[#94a3b8] font-mono">scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#6366f1] to-transparent" />
      </div>
    </section>
  );
}
