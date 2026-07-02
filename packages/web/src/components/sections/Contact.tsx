'use client';

import { useState, FormEvent } from 'react';
import { reachMetrikaGoal } from '@/lib/metrika';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('ok');
      setForm({ name: '', email: '', message: '' });
      reachMetrikaGoal('contact_form_success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Контакт</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">Напишите мне</h2>
          <p className="text-[#94a3b8]">Открыт к интересным проектам и предложениям о сотрудничестве</p>
        </div>

        {status === 'ok' ? (
          <div className="text-center py-8">
            <svg aria-hidden="true" className="w-8 h-8 text-[#10b981] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-[#10b981] font-semibold mb-1">Сообщение отправлено!</p>
            <p className="text-[#94a3b8] text-sm">Я отвечу в ближайшее время.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 px-4 py-2 text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] rounded-lg"
            >
              Отправить ещё
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className="block text-xs text-[#94a3b8] mb-1.5 font-mono uppercase tracking-wide">Имя</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ваше имя"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f1f5f9] text-sm placeholder:text-[#94a3b8]/50 outline-none focus-visible:border-[#6366f1]/70 focus-visible:ring-2 focus-visible:ring-[#6366f1]/30 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs text-[#94a3b8] mb-1.5 font-mono uppercase tracking-wide">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f1f5f9] text-sm placeholder:text-[#94a3b8]/50 outline-none focus-visible:border-[#6366f1]/70 focus-visible:ring-2 focus-visible:ring-[#6366f1]/30 transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-xs text-[#94a3b8] mb-1.5 font-mono uppercase tracking-wide">Сообщение</label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Расскажите о вашем проекте или задаче..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f1f5f9] text-sm placeholder:text-[#94a3b8]/50 outline-none focus-visible:border-[#6366f1]/70 focus-visible:ring-2 focus-visible:ring-[#6366f1]/30 transition-colors resize-none"
              />
            </div>

            {status === 'error' && (
              <p role="alert" className="text-red-400 text-sm text-center">Не удалось отправить. Попробуйте позже.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-[#6366f1] text-white hover:bg-[#4f46e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Отправляем...' : 'Отправить сообщение'}
            </button>
          </form>
        )}

        <div className="mt-12 text-center space-y-2">
          <p className="text-[#94a3b8] text-sm">Или напрямую:</p>
          <a
            href="mailto:i@paulislava.space"
            className="text-[#6366f1] hover:text-[#06b6d4] transition-colors font-mono text-sm"
          >
            i@paulislava.space
          </a>
        </div>
      </div>
    </section>
  );
}
