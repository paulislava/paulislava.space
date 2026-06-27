const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN ?? '';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/[а-яё]/gi, (ch) => {
      const map: Record<string, string> = {
        а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',
        к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',
        х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
      };
      return map[ch.toLowerCase()] ?? ch;
    })
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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
  console.log('🌱 Starting seed...');

  // --- Technologies ---
  const techs: Record<string, number> = {};
  const techList = [
    { name: 'React', category: 'Frontend' },
    { name: 'React Native', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'TypeScript', category: 'Frontend' },
    { name: 'Redux', category: 'Frontend' },
    { name: 'GraphQL', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'NestJS', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'Strapi', category: 'Backend' },
    { name: 'PHP', category: 'Backend' },
    { name: 'Python', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    { name: 'RabbitMQ', category: 'Backend' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'GitHub Actions', category: 'DevOps' },
    { name: 'GitLab CI', category: 'DevOps' },
    { name: 'Nginx', category: 'DevOps' },
    { name: 'Linux', category: 'DevOps' },
    { name: 'S3', category: 'DevOps' },
    { name: 'TypeORM', category: 'Backend' },
    { name: 'Telegraf', category: 'Backend' },
    { name: 'WebDAV', category: 'Backend' },
    { name: 'Webpack', category: 'Frontend' },
    { name: 'REST', category: 'Backend' },
    { name: 'Swagger', category: 'Backend' },
    { name: 'MDX', category: 'Frontend' },
    { name: 'Hestia', category: 'DevOps' },
  ];

  for (const tech of techList) {
    const created = await post('technologies', { ...tech, slug: slugify(tech.name) });
    techs[tech.name] = created.id;
    console.log(`  ✓ Technology: ${tech.name}`);
  }

  // --- Tags ---
  const tags = [
    { name: 'Web', category: 'project', color: '#6366f1' },
    { name: 'Mobile', category: 'project', color: '#06b6d4' },
    { name: 'Telegram', category: 'project', color: '#0ea5e9' },
    { name: 'Open Source', category: 'project', color: '#10b981' },
    { name: 'MVP', category: 'project', color: '#f59e0b' },
    { name: 'SberDevices', category: 'news', color: '#22c55e' },
    { name: 'Релиз', category: 'news', color: '#a855f7' },
    { name: 'Разработка', category: 'article', color: '#6366f1' },
    { name: 'DevOps', category: 'article', color: '#f97316' },
    { name: 'Архитектура', category: 'article', color: '#ec4899' },
  ];

  for (const tag of tags) {
    await post('tags', { ...tag, slug: slugify(tag.name) });
    console.log(`  ✓ Tag: ${tag.name}`);
  }

  // --- Work Experiences ---
  const workExperiences = [
    {
      title: 'Архитектор',
      company: 'BEZNOMERA',
      companyUrl: 'https://beznomera.net',
      startDate: '2025-01-01',
      endDate: null,
      isRemote: true,
      location: 'Екатеринбург, Россия',
      description: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Придумал, спроектировал и разработал мини-приложение в Telegram, веб-сайт и чат-бот для соцсети для водителей BEZNOMERA. Проект позволяет водителю оставить QR-код ведущий на персональный профиль автомобиля анонимно.',
          }],
        },
      ],
      technologies: Object.entries(techs)
        .filter(([name]) => ['React Native', 'React', 'Next.js', 'NestJS', 'S3', 'PostgreSQL', 'Docker', 'GitHub Actions', 'Telegraf', 'TypeORM'].includes(name))
        .map(([, id]) => id),
    },
    {
      title: 'Техлид, DevOps',
      company: 'Kursoved.Pro',
      companyUrl: 'https://kursoved.pro',
      startDate: '2024-05-01',
      endDate: null,
      isRemote: true,
      location: 'Россия',
      description: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Ответственный за DevOps (CI/CD, администрирование сервера) и техлид клиентской части проекта. Архитектурно определяю взаимодействие серверной и клиентской части.',
          }],
        },
      ],
      technologies: Object.entries(techs)
        .filter(([name]) => ['React', 'Docker', 'GitLab CI', 'Linux', 'TypeScript', 'Swagger', 'Hestia'].includes(name))
        .map(([, id]) => id),
    },
    {
      title: 'Senior-разработчик, техлид команды',
      company: 'SberDevices',
      startDate: '2022-10-01',
      endDate: null,
      isRemote: true,
      location: 'Россия',
      description: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Разработка сайта нейросети Gigachat и портала для разработчиков Сбера. Создание визуального MDX-редактора для технических писателей. Техлид команды, проведение code-review, менторство стажёров.',
          }],
        },
      ],
      technologies: Object.entries(techs)
        .filter(([name]) => ['React', 'Next.js', 'GraphQL', 'Express.js', 'Strapi', 'TypeScript', 'Docker', 'Nginx', 'Redis', 'MDX'].includes(name))
        .map(([, id]) => id),
    },
    {
      title: 'Техлид проекта',
      company: 'Брусника',
      startDate: '2022-03-01',
      endDate: '2022-10-01',
      isRemote: false,
      location: 'Екатеринбург, Россия',
      description: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Разработка и доработка функционала внутреннего сервиса BIM.Себестоимость. Интеграции с внутренними и внешними сервисами (тендерная площадка, электронный документооборот).',
          }],
        },
      ],
      technologies: Object.entries(techs)
        .filter(([name]) => ['TypeScript', 'Node.js', 'Redux', 'React', 'PostgreSQL', 'RabbitMQ', 'Swagger', 'Nginx', 'Webpack', 'WebDAV'].includes(name))
        .map(([, id]) => id),
    },
    {
      title: 'Ведущий разработчик, тимлид',
      company: 'УрФУ',
      startDate: '2018-09-01',
      endDate: '2022-03-01',
      isRemote: false,
      location: 'Екатеринбург, Россия',
      description: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Проектирование и разработка веб-сайтов и сервисов УрФУ. Создание сервиса мониторинга изменений контента с интеграцией в Mattermost. Управление разработкой, администрирование серверов.',
          }],
        },
      ],
      technologies: Object.entries(techs)
        .filter(([name]) => ['PHP', 'Python', 'PostgreSQL', 'Linux', 'Docker'].includes(name))
        .map(([, id]) => id),
    },
  ];

  for (const exp of workExperiences) {
    const { technologies, ...rest } = exp;
    const created = await post('work-experiences', {
      ...rest,
      technologies: technologies.length > 0 ? technologies : undefined,
    });
    console.log(`  ✓ Work Experience: ${exp.title} at ${exp.company} (id: ${created.id})`);
  }

  // --- Project: BEZNOMERA ---
  await post('projects', {
    title: 'BEZNOMERA',
    slug: 'beznomera',
    shortDescription: 'Социальная сеть для водителей с Telegram Mini App, чат-ботом и QR-кодами',
    url: 'https://beznomera.net',
    featured: true,
    description: [
      {
        type: 'paragraph',
        children: [{
          type: 'text',
          text: 'Мини-приложение в Telegram, веб-сайт и чат-бот для соцсети водителей. Позволяет разместить QR-код на автомобиле для анонимной связи с владельцем через персональный профиль. Реализованы статистика, ролевая модель, кастомизация страницы авто, CI/CD на self-hosted GitHub Actions.',
        }],
      },
    ],
    technologies: Object.entries(techs)
      .filter(([name]) => ['React Native', 'React', 'Next.js', 'NestJS', 'S3', 'PostgreSQL', 'Docker', 'GitHub Actions', 'Telegraf', 'TypeORM'].includes(name))
      .map(([, id]) => id),
  });
  console.log('  ✓ Project: BEZNOMERA');

  console.log('\n✅ Seed complete!');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
