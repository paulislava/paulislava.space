import { getAllProjects, getArticles, getNewsItems } from '@/lib/strapi';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 1800;

function line(title: string, path: string, description?: string) {
  return `- [${title}](${SITE_URL}${path})${description ? `: ${description}` : ''}`;
}

export async function GET() {
  const [projects, articles, news] = await Promise.all([
    getAllProjects().catch(() => []),
    getArticles(25).catch(() => []),
    getNewsItems(25).catch(() => []),
  ]);

  const body = [
    '# paulislava.space',
    '',
    '> Павел Кондратов — Software Engineer. Сайт содержит портфолио проектов, статьи и новости о разработке, архитектуре, React, Next.js, NestJS, DevOps и AI-инструментах.',
    '',
    '## Основные страницы',
    line('Главная', '/', 'профиль, опыт, навыки, избранные проекты, статьи и контактная форма'),
    line('Проекты', '/projects', 'портфолио проектов'),
    line('Статьи', '/articles', 'технические статьи'),
    line('RSS', '/rss.xml', 'объединенная RSS-лента статей и новостей'),
    line('Sitemap', '/sitemap.xml', 'карта сайта для индексации'),
    '',
    '## Проекты',
    ...projects.map((project) => line(project.title, `/projects/${project.slug}`, project.shortDescription ?? undefined)),
    '',
    '## Статьи',
    ...articles.map((article) => line(article.title, `/articles/${article.slug}`, article.excerpt ?? undefined)),
    '',
    '## Новости',
    ...news.map((item) => line(item.title, `/news/${item.slug}`, item.excerpt ?? undefined)),
    '',
    '## Контакты и авторство',
    '- Автор: Павел Кондратов',
    '- Email: i@paulislava.space',
    '- GitHub: https://github.com/paulislava',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=1800',
    },
  });
}
