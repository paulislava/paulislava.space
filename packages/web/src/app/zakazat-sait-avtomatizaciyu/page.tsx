import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProjects, mediaUrl } from '@/lib/strapi';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Разработка сайтов, сервисов и автоматизации для бизнеса',
  description: 'Разрабатываю сайты, веб-сервисы, личные кабинеты, автоматизацию и чат-ботов. Посмотрите реальные проекты Павла Кондратова и расскажите о своей задаче.',
  alternates: { canonical: '/zakazat-sait-avtomatizaciyu' },
  openGraph: {
    title: 'Разработка для бизнеса — Павел Кондратов',
    description: 'От сайта и личного кабинета до автоматизации процессов. Реальные проекты и прямой контакт с разработчиком.',
    url: '/zakazat-sait-avtomatizaciyu',
  },
};

const services = [
  { name: 'Сайты и лендинги', detail: 'Корпоративные сайты, продуктовые страницы, каталоги и контентные порталы.' },
  { name: 'Веб-сервисы', detail: 'Личные кабинеты, внутренние системы, интерфейсы для клиентов и сотрудников.' },
  { name: 'Автоматизация', detail: 'Заявки, документы, интеграции и процессы, которые сейчас требуют ручной работы.' },
  { name: 'Чат-боты и AI', detail: 'Боты и инструменты, которые отвечают, помогают искать информацию и выполняют задачи.' },
];

const cases = [
  { slug: 'vremya-karery', title: 'Время карьеры', kind: 'Портал', description: 'Карьерная платформа для студентов, выпускников и работодателей.' },
  { slug: 'po-garantiya', title: 'ПО «Гарантия»', kind: 'B2B-сайт', description: 'Корпоративный сайт производителя с представлением продукции и направлений работы.' },
  { slug: 'kursoved-pro', title: 'Курсовед', kind: 'Автоматизация', description: 'Платформа учебного центра: программы, роли, документы и контроль обучения.' },
  { slug: 'beznomera', title: 'BEZNOMERA', kind: 'Бот и веб-сервис', description: 'Telegram-бот и веб-сервис для связи с владельцем автомобиля.' },
];

export default async function BusinessLandingPage() {
  const projects = await getAllProjects().catch(() => []);
  const bySlug = new Map(projects.map((project) => [project.slug, project]));

  return (
    <main className={styles.landing}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Павел Кондратов · разработка для компаний</p>
          <h1>Вашей идее нужен <span>работающий продукт.</span></h1>
          <p className={styles.lead}>Создаю сайты, сервисы и автоматизацию, которые помогают бизнесу принимать заявки, обслуживать клиентов и работать быстрее.</p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="#contact">Обсудить задачу <span aria-hidden="true">↗</span></a>
            <a className={styles.textLink} href="#work">Посмотреть работы <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.visualFrame}>
            <div className={styles.visualTop}><span /><span /><span /><i>paulislava.space / build</i></div>
            <div className={styles.visualContent}>
              <div className={styles.visualAccent}>Идея → запуск</div>
              <div className={styles.visualLine} /><div className={styles.visualLineShort} />
              <div className={styles.visualGrid}><span>Сайт</span><span>Сервис</span><span>Автоматизация</span><span>Бот</span></div>
              <div className={styles.visualStamp}>Сделано<br />под задачу</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.services} id="services">
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>Что можно заказать</p>
          <h2>Разработка, которая решает конкретную задачу</h2>
          <p>От первой страницы до системы, которой каждый день пользуются клиенты и команда.</p>
        </div>
        <div className={styles.serviceList}>
          {services.map((service) => (
            <div className={styles.serviceRow} key={service.name}>
              <h3>{service.name}</h3><p>{service.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.work} id="work">
        <div className={styles.workHeading}>
          <div><p className={styles.kicker}>Реальные проекты</p><h2>Уже разработал</h2></div>
          <Link className={styles.textLink} href="/projects">Все проекты <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.caseGrid}>
          {cases.map((item) => {
            const project = bySlug.get(item.slug);
            const cover = project && (mediaUrl(project.cover, 'medium') ?? mediaUrl(project.cover));
            return (
              <Link className={styles.case} href={`/projects/${item.slug}`} key={item.slug}>
                <div className={styles.caseImage}>
                  {cover ? <Image src={cover} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" className={styles.cover} /> : <span className={styles.caseFallback}>{item.title}</span>}
                </div>
                <div className={styles.caseMeta}><span>{item.kind}</span><span aria-hidden="true">↗</span></div>
                <h3>{item.title}</h3><p>{item.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.experience}>
        <div><p className={styles.kicker}>Опыт в разных форматах</p><h2>Не ограничиваюсь одним типом проекта</h2></div>
        <p>В портфолио — корпоративные сайты, образовательные и карьерные порталы, B2B-интерфейсы, платформы для обучения, мобильное приложение, Telegram-бот и внутренние сервисы. Подбираю решение под процесс компании, а не под шаблон.</p>
      </section>

      <section className={styles.finalCta}>
        <h2>Расскажите, что хотите запустить или улучшить.</h2>
        <p>Опишите задачу своими словами. Я предложу, с чего начать и какой формат разработки подойдёт.</p>
        <a className={styles.primaryButton} href="#contact">Написать о проекте <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  );
}
