import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';

// Все корневые cache-теги контента (см. lib/strapi.ts). Обновление любой страницы
// сбрасывает их целиком — на персональном сайте это дёшево и снимает вопрос
// «какие именно теги затронуты этой страницей».
const ALL_CONTENT_TAGS = [
  'technologies',
  'work-experiences',
  'projects',
  'articles',
  'news',
  'tags',
  'article-series',
];

export async function POST(req: NextRequest) {
  // Авторизация — по расшаренной admin-cookie, отдельный секрет не нужен.
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Опционально можно передать точечные теги (например, `project-<slug>`),
  // чтобы вместе с корневыми обновить и конкретную сущность.
  let extraTags: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.tags)) {
      extraTags = body.tags.filter((t: unknown): t is string => typeof t === 'string');
    }
  } catch {
    // тело необязательно
  }

  const tags = Array.from(new Set([...ALL_CONTENT_TAGS, ...extraTags]));
  for (const tag of tags) {
    revalidateTag(tag, 'default');
  }

  return NextResponse.json({ revalidated: true, tags });
}
