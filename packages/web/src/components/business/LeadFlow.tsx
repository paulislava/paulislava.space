'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { reachMetrikaGoal } from '@/lib/metrika';
import styles from './LeadFlow.module.css';

type LeadContextValue = { open: () => void; submitContact: (contact: string) => Promise<void> };
const LeadContext = createContext<LeadContextValue>({ open: () => {}, submitContact: async () => {} });

async function sendLead(contact: string) {
  const response = await fetch('/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intent: 'lead', contact }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Не удалось отправить. Попробуйте ещё раз.');
  return result.token as string;
}

export function LeadButton({ children = 'Обсудить проект', className }: { children?: ReactNode; className?: string }) {
  const { open } = useContext(LeadContext);
  return <button type="button" className={className} onClick={open}>{children}</button>;
}

export function LeadInlineForm() {
  const { submitContact } = useContext(LeadContext);
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submitInline(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await submitContact(contact);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось отправить. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  return <section className={styles.inlineLead} aria-labelledby="inline-lead-heading">
    <div className={styles.inlineLeadInner}>
      <div className={styles.inlineLeadCopy}>
        <p>Обсудим вашу задачу</p>
        <h2 id="inline-lead-heading">Есть идея?<br />Давайте начнём.</h2>
        <span>Оставьте удобный контакт. Я отвечу лично и предложу, с чего начать проект.</span>
      </div>
      <form className={styles.inlineLeadForm} onSubmit={submitInline}>
        <label htmlFor="inline-lead-contact">Контакт</label>
        <input id="inline-lead-contact" required type="text" autoComplete="off" maxLength={160} placeholder="Телефон, @telegram или email" value={contact} onChange={(event) => setContact(event.target.value)} aria-describedby="inline-lead-hint" />
        <p id="inline-lead-hint">Одного способа связи достаточно.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Отправляю…' : 'Обсудить проект'} <span aria-hidden="true">↗</span></button>
      </form>
    </div>
  </section>;
}

export default function LeadFlow({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'contact' | 'details' | 'done'>('contact');
  const [contact, setContact] = useState('');
  const [token, setToken] = useState('');
  const [details, setDetails] = useState({ name: '', company: '', message: '', timing: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const inFlight = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const modal = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal?.showModal();
    return () => { document.body.style.overflow = overflow; };
  }, [open]);

  useEffect(() => {
    if (open && step !== 'contact') {
      dialog.current?.scrollTo({ top: 0 });
      heading.current?.focus({ preventScroll: true });
    }
  }, [step, open]);

  const openModal = useCallback(() => {
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener('business-lead-open', openModal);
    return () => window.removeEventListener('business-lead-open', openModal);
  }, [openModal]);

  async function submitContact(value: string) {
    const leadToken = await sendLead(value);
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setContact(value);
    setToken(leadToken);
    setStep('details');
    setOpen(true);
    reachMetrikaGoal('contact_form_success', { source: 'business_landing' });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    const isContact = step === 'contact';
    try {
      if (isContact) {
        await submitContact(contact);
      } else {
        const response = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intent: 'details', token, ...details }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Не удалось отправить. Попробуйте ещё раз.');
        setStep('done');
        reachMetrikaGoal('business_lead_details');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось отправить. Попробуйте ещё раз.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return <LeadContext.Provider value={{ open: openModal, submitContact }}>
    {children}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="lead-heading" onCancel={(event) => { event.preventDefault(); setOpen(false); }} onClick={(event) => { if (event.target === dialog.current) setOpen(false); }}>
      <motion.div className={styles.panel} initial={false} animate={{ opacity: open ? 1 : 0, scale: open || reduced ? 1 : .97, y: open || reduced ? 0 : 12 }} transition={{ type: 'spring', bounce: 0, duration: reduced ? .1 : .3 }} onAnimationComplete={() => { if (!open) { dialog.current?.close(); trigger.current?.focus({ preventScroll: true }); } }}>
        <button className={styles.close} type="button" aria-label="Закрыть окно" onClick={() => setOpen(false)}><span aria-hidden="true">×</span></button>
        {step === 'contact' ? <>
          <p className={styles.eyebrow}>Начнём с разговора</p>
          <h2 id="lead-heading" ref={heading} tabIndex={-1}>Что сделаем<br />для вашего бизнеса?</h2>
          <p className={styles.description}>Оставьте удобный контакт. Я свяжусь с вами, разберусь в задаче и предложу следующий шаг.</p>
          <form onSubmit={submit}>
            <label htmlFor="lead-contact">Контакт</label>
            <input id="lead-contact" autoFocus required type="text" autoComplete="off" maxLength={160} placeholder="Телефон, @telegram или email" value={contact} onChange={(event) => setContact(event.target.value)} aria-describedby="lead-hint" />
            <p id="lead-hint" className={styles.hint}>Достаточно одного способа связи.</p>
            {error && <p role="alert" className={styles.error}>{error}</p>}
            <button className={styles.submit} disabled={busy}>{busy ? 'Отправляю…' : 'Обсудить проект'}</button>
            <p className={styles.footnote}>Контакт нужен, чтобы ответить на вашу заявку.</p>
          </form>
        </> : step === 'details' ? <>
          <span className={styles.check} aria-hidden="true">✓</span>
          <h2 id="lead-heading" ref={heading} tabIndex={-1}>Контакт получен.</h2>
          <p className={styles.description}>Я свяжусь с вами. А пока можете рассказать о проекте — так наш разговор будет предметнее.</p>
          <form onSubmit={submit}>
            <div className={styles.row}><div><label htmlFor="lead-name">Как к вам обращаться</label><input id="lead-name" autoComplete="name" maxLength={100} value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} placeholder="Ваше имя" /></div><div><label htmlFor="lead-company">Компания</label><input id="lead-company" autoComplete="organization" maxLength={160} value={details.company} onChange={(e) => setDetails({ ...details, company: e.target.value })} placeholder="Название или сайт" /></div></div>
            <label htmlFor="lead-message">Что хотите сделать?</label><textarea id="lead-message" rows={4} maxLength={5000} placeholder="Нужен сайт, новый сервис или автоматизация? Расскажите, как задача решается сейчас." value={details.message} onChange={(e) => setDetails({ ...details, message: e.target.value })} />
            <label htmlFor="lead-timing">Есть ли срок или ориентир по бюджету?</label><input id="lead-timing" maxLength={300} value={details.timing} onChange={(e) => setDetails({ ...details, timing: e.target.value })} placeholder="Если уже определились" />
            <p className={styles.hint}>Все поля необязательные. Контакт уже отправлен.</p>
            {error && <p role="alert" className={styles.error}>{error}</p>}
            <button className={styles.submit} disabled={busy || !Object.values(details).some((value) => value.trim())}>{busy ? 'Отправляю…' : 'Добавить подробности'}</button>
            <button className={styles.skip} type="button" onClick={() => setOpen(false)}>Расскажу при общении</button>
          </form>
        </> : <div className={styles.done}>
          <span className={styles.check} aria-hidden="true">✓</span><h2 id="lead-heading" ref={heading} tabIndex={-1}>Спасибо.<br />Теперь есть с чего начать.</h2><p className={styles.description}>Подробности отправлены вместе с вашим контактом. До связи!</p><button type="button" className={styles.submit} onClick={() => setOpen(false)}>Вернуться к работам</button>
        </div>}
      </motion.div>
    </dialog>
  </LeadContext.Provider>;
}
