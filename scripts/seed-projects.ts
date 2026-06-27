// Run: STRAPI_URL=https://cms.paulislava.space STRAPI_API_TOKEN=<token> npx tsx scripts/seed-projects.ts

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN ?? '';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function get(endpoint: string) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}?pagination[limit]=100`, { headers });
  if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
  return (await res.json()).data;
}

async function post(endpoint: string, data: unknown) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${endpoint} failed: ${res.status} ${text}`);
  }
  return (await res.json()).data;
}

async function main() {
  console.log('🌱 Loading existing technologies...');

  const techData = await get('technologies');
  const techs: Record<string, number> = {};
  for (const t of techData) {
    techs[t.name] = t.id;
  }
  console.log(`  Found ${Object.keys(techs).length} technologies`);

  const projects = [
    {
      title: 'NoSmoke',
      slug: 'nosmoke',
      shortDescription: 'Telegram Mini App для отказа от курения с трекером и мотивацией',
      url: 'https://nosmoke.paulislava.space',
      featured: true,
      description: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Приложение в Telegram для тех, кто бросает курить. Трекер дней без сигарет, подсчёт сэкономленных денег, мотивационные уведомления. Реализовано как Telegram Mini App с NestJS backend.' }],
        },
      ],
      techNames: ['React', 'TypeScript', 'NestJS', 'PostgreSQL', 'Docker', 'GitHub Actions', 'Telegraf'],
    },
    {
      title: 'Budget',
      slug: 'budget',
      shortDescription: 'Личный трекер бюджета с категориями и аналитикой',
      url: 'https://budget.paulislava.space',
      featured: false,
      description: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Веб-приложение для ведения личного бюджета. Категории доходов и расходов, история транзакций, графики и аналитика.' }],
        },
      ],
      techNames: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    },
    {
      title: 'Mentorial',
      slug: 'mentorial',
      shortDescription: 'Платформа для менторства и обучения',
      url: 'https://mentorial.paulislava.space',
      featured: false,
      description: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Платформа для менторства: профили менторов, запись на сессии, отслеживание прогресса.' }],
        },
      ],
      techNames: ['React', 'TypeScript', 'NestJS', 'PostgreSQL', 'Docker'],
    },
    {
      title: 'posurfu.ru',
      slug: 'posurfu',
      shortDescription: 'Сервис мониторинга и уведомлений для студентов УрФУ',
      url: 'https://posurfu.ru',
      featured: false,
      description: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Сервис для студентов Уральского федерального университета: мониторинг изменений в расписании и важных страницах сайта, уведомления в Mattermost.' }],
        },
      ],
      techNames: ['Python', 'PostgreSQL', 'Linux', 'Docker'],
    },
    {
      title: 'МС Гармония',
      slug: 'ms-garmoniya',
      shortDescription: 'Сайт медицинского центра',
      url: 'https://xn----7sbbfpbf6absffmg8h.xn--p1ai',
      featured: false,
      description: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Корпоративный сайт медицинского центра Гармония: информация об услугах, врачах, запись на приём.' }],
        },
      ],
      techNames: ['PHP', 'Linux', 'Nginx'],
    },
    {
      title: 'paulislava.space',
      slug: 'paulislava-space',
      shortDescription: 'Личный иммерсивный сайт-портфолио с CMS',
      url: 'https://paulislava.space',
      featured: true,
      description: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Этот самый сайт — иммерсивный портфолио с тёмной glassmorphism-эстетикой, GSAP-анимациями и Strapi CMS. Next.js 15 (App Router, ISR), Strapi v5, Docker, GitHub Actions CI/CD.' }],
        },
      ],
      techNames: ['Next.js', 'TypeScript', 'Strapi', 'Docker', 'GitHub Actions', 'PostgreSQL', 'S3', 'Nginx'],
    },
    {
      title: 'GigaChat Dev Portal',
      slug: 'gigachat-dev-portal',
      shortDescription: 'Сайт нейросети GigaChat и портал для разработчиков Сбера',
      url: 'https://developers.sber.ru',
      featured: true,
      description: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Разработка сайта нейросети GigaChat и портала для разработчиков Сбера в команде SberDevices. Визуальный MDX-редактор для технических писателей, интеграция с GraphQL API.' }],
        },
      ],
      techNames: ['React', 'Next.js', 'TypeScript', 'GraphQL', 'Express.js', 'Strapi', 'Redis', 'Docker', 'Nginx', 'MDX'],
    },
    {
      title: 'BIM.Себестоимость',
      slug: 'bim-sebestoimost',
      shortDescription: 'Внутренний сервис управления себестоимостью для застройщика Брусника',
      featured: false,
      description: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Внутренний сервис BIM.Себестоимость для управления строительными проектами. Интеграции с тендерной площадкой и электронным документооборотом, WebDAV для хранения документов.' }],
        },
      ],
      techNames: ['TypeScript', 'Node.js', 'React', 'Redux', 'PostgreSQL', 'RabbitMQ', 'Swagger', 'Nginx', 'Webpack', 'WebDAV'],
    },
  ];

  console.log('\n🌱 Seeding projects...');
  for (const { techNames, ...project } of projects) {
    const technologies = techNames
      .map((name) => techs[name])
      .filter(Boolean);

    const created = await post('projects', { ...project, technologies });
    console.log(`  ✓ Project: ${project.title} (id: ${created.id})`);
  }

  console.log('\n✅ Projects seed complete!');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
