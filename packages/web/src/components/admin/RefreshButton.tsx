'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface RefreshButtonProps {
  /** Дополнительные точечные теги для ревалидации (например, `project-<slug>`). */
  tags?: string[];
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function RefreshButton({ tags }: RefreshButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tags?.length ? { tags } : {}),
      });
      if (!res.ok) throw new Error(`refresh failed: ${res.status}`);
      // Сбрасываем клиентский роутер-кеш, чтобы увидеть свежий контент.
      startTransition(() => router.refresh());
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  const busy = status === 'loading' || isPending;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label="Обновить кеш страницы"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-[#6366f1]/40 bg-[#0a0a0f]/90 px-4 py-3 font-mono text-sm text-[#f1f5f9] shadow-lg shadow-black/40 backdrop-blur transition-colors hover:border-[#06b6d4] hover:text-[#06b6d4] disabled:opacity-60"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={busy ? 'animate-spin' : ''}
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
      <span>
        {status === 'loading' ? 'Обновляю…' : status === 'done' ? 'Готово' : status === 'error' ? 'Ошибка' : 'Обновить'}
      </span>
    </button>
  );
}
