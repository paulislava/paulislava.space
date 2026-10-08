import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';

function field(value: unknown, limit: number) {
  return typeof value === 'string' && value.length <= limit ? value.trim() : '';
}

function validContact(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    || /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value)
    || /^(?:https?:\/\/)?t\.me\/[a-zA-Z][a-zA-Z0-9_]{4,31}\/?$/.test(value)
    || (/^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 7 && value.replace(/\D/g, '').length <= 15);
}

function sign(payload: string) {
  return createHmac('sha256', process.env.CONTACT_TOKEN_SECRET || process.env.SMTP_PASS || '').update(`business-lead:${payload}`).digest('hex');
}

function readToken(token: string): { id: string; contact: string } | null {
  try {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra || !/^[a-f0-9]{64}$/.test(signature)) return null;
    if (!timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(sign(payload), 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.id !== 'string' || typeof data.contact !== 'string' || !validContact(data.contact) || !Number.isFinite(data.time) || Date.now() - data.time > 86400000 || data.time > Date.now()) return null;
    return data;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 16000) return NextResponse.json({ error: 'Слишком длинное сообщение.' }, { status: 413 });
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    body = parsed;
  } catch {
    return NextResponse.json({ error: 'Не удалось прочитать заявку.' }, { status: 400 });
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json({ error: 'Отправка временно недоступна. Напишите на i@paulislava.space.' }, { status: 503 });
  }

  let contact = field(body.contact ?? body.email, 160);
  let subject: string;
  let text: string;
  let token: string | undefined;
  if (body.intent === 'details') {
    const lead = readToken(field(body.token, 2000));
    if (!lead) return NextResponse.json({ error: 'Срок добавления подробностей истёк. Контакт уже отправлен — расскажите о задаче при общении.' }, { status: 400 });
    contact = lead.contact;
    const name = field(body.name, 100);
    const company = field(body.company, 160);
    const message = field(body.message, 5000);
    const timing = field(body.timing, 300);
    if (![name, company, message, timing].some(Boolean)) return NextResponse.json({ error: 'Добавьте хотя бы одну подробность.' }, { status: 400 });
    subject = `[paulislava.space] Подробности проекта ${lead.id}`;
    text = `Заявка: ${lead.id}\nКонтакт: ${contact}\nИмя: ${name || '—'}\nКомпания: ${company || '—'}\nСрок и бюджет: ${timing || '—'}\n\n${message}`;
  } else {
    if (!validContact(contact)) return NextResponse.json({ error: 'Укажите телефон, Telegram (@username) или email.' }, { status: 400 });
    if (body.intent === 'lead') {
      const id = randomUUID();
      const payload = Buffer.from(JSON.stringify({ id, contact, time: Date.now() })).toString('base64url');
      token = `${payload}.${sign(payload)}`;
      subject = `[paulislava.space] Новый проект ${id}`;
      text = `Заявка с лендинга для компаний\nЗаявка: ${id}\nКонтакт: ${contact}\n\nПосетитель просит связаться для обсуждения проекта. Подробности могут прийти отдельным письмом с тем же номером.`;
    } else {
      const name = field(body.name, 100);
      const message = field(body.message, 5000);
      if (!name || !message) return NextResponse.json({ error: 'Укажите имя и сообщение.' }, { status: 400 });
      subject = '[paulislava.space] Новое сообщение';
      text = `Имя: ${name}\nКонтакт: ${contact}\n\n${message}`;
    }
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
  });
  try {
    await transporter.sendMail({
      from: `"paulislava.space" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL ?? process.env.SMTP_USER,
      ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? { replyTo: contact } : {}),
      subject, text,
    });
  } catch {
    console.error('Contact email delivery failed');
    return NextResponse.json({ error: 'Не удалось отправить. Попробуйте ещё раз или напишите на i@paulislava.space.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, ...(token ? { token } : {}) });
}
