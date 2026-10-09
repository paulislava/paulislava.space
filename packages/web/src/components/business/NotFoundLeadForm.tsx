'use client';

import { useState, type FormEvent } from 'react';
import { useLeadContact } from './LeadFlow';

export default function NotFoundLeadForm() {
  const submitContact = useLeadContact();
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await submitContact(contact);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось отправить. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 sm:p-8 backdrop-blur-sm">
    <p className="text-xs uppercase tracking-[0.18em] text-[#a5a7bc]">Новый маршрут</p>
    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Есть задача для разработки?</h2>
    <p className="mt-3 max-w-md text-sm leading-relaxed text-[#a5a7bc]">Оставьте контакт. Я отвечу лично и помогу определить первый шаг.</p>
    <label htmlFor="not-found-contact" className="mt-7 block text-sm font-medium text-white">Как с вами связаться</label>
    <input id="not-found-contact" required maxLength={160} autoComplete="off" type="text" placeholder="Телефон, @telegram или email" value={contact} onChange={(event) => setContact(event.target.value)} className="mt-3 w-full rounded-xl border border-white/15 bg-[#101018] px-4 py-3.5 text-base text-white outline-none placeholder:text-[#777b8c] focus-visible:border-[#818cf8] focus-visible:ring-2 focus-visible:ring-[#818cf8]/30" />
    {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    <button type="submit" disabled={busy} className="mt-4 w-full rounded-xl bg-[#6366f1] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#7779f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#818cf8] disabled:opacity-60">{busy ? 'Отправляю…' : 'Обсудить проект'}</button>
    <p className="mt-3 text-xs text-[#777b8c]">Для начала достаточно одного контакта.</p>
  </form>;
}
