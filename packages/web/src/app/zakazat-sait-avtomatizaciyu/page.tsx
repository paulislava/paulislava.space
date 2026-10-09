import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProjects, getProjectBySlug, getTechnologies, getProjectTags, mediaUrl } from '@/lib/strapi';
import Skills from '@/components/sections/Skills';
import LandingMotion from '@/components/business/LandingMotion';
import { LeadButton, LeadInlineForm } from '@/components/business/LeadFlow';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Сайты, сервисы и автоматизация для бизнеса',
  description: 'Павел Кондратов — разработка сайтов, приложений и автоматизации для компаний. Реальные проекты, прямое общение и запуск под вашу задачу.',
  alternates: { canonical: '/zakazat-sait-avtomatizaciyu' },
  openGraph: { title: 'Разработка для бизнеса — Павел Кондратов', description: 'От первого впечатления до ежедневной работы. Сайты, сервисы и автоматизация для вашей компании.', url: '/zakazat-sait-avtomatizaciyu' },
};

const selectedWork = [
  { slug: 'urfu-100', title: '100 лет УрФУ', type: 'Интерактивный сайт', text: 'История университета, которую можно исследовать. Анимация и взаимодействие в каждом разделе.' },
  { slug: 'po-garantiya', title: 'ПО «Гарантия»', type: 'Сайт производителя', text: 'Продукция и возможности предприятия — для заказчиков строительных конструкций.' },
  { slug: 'easychem', title: 'EasyChem', type: 'Образовательная платформа', text: 'Химические турниры, проекты, игры и материалы для преподавателей.' },
  { slug: 'beznomera', title: 'BEZNOMERA', type: 'Telegram-бот и сервис', text: 'Связь с владельцем автомобиля по госномеру без раскрытия номера телефона.' },
];

export default async function BusinessLandingPage() {
  const [projects, career, courses, technologies, tags] = await Promise.all([
    getAllProjects().catch(() => []),
    getProjectBySlug('vremya-karery').catch(() => null),
    getProjectBySlug('kursoved-pro').catch(() => null),
    getTechnologies().catch(() => []),
    getProjectTags().catch(() => []),
  ]);
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const imageFor = (slug: string) => mediaUrl(bySlug.get(slug)?.cover);
  const urfu = imageFor('urfu-100');
  const umnoc = imageFor('umnoc');
  const careerImage = mediaUrl(career?.screenshots?.[0]) ?? imageFor('vremya-karery');
  const coursesImage = mediaUrl(courses?.screenshots?.[1]) ?? imageFor('kursoved-pro');
  const story = [
    { title: 'Выделяться.\nЗапоминаться.', label: 'Сайты и лендинги', text: 'Покажите, чем сильна ваша компания. Помогу представить продукт, объяснить сложное и привести посетителя к обращению.', project: '100 лет УрФУ', slug: 'urfu-100', image: urfu, note: 'Интерактивный сайт с анимацией и историей университета.' },
    { title: 'Больше,\nчем страница.', label: 'Сервисы и платформы', text: 'Поиск, личные кабинеты, роли и работа с данными. Когда бизнесу нужен собственный инструмент, разработаю его под ваших клиентов и команду.', project: 'Время карьеры', slug: 'vremya-karery', image: careerImage, note: 'Карьерный портал для студентов, выпускников и работодателей.' },
    { title: 'Меньше рутины.\nБольше дела.', label: 'Автоматизация и интеграции', text: 'Заявки, документы, уведомления и передача данных между сервисами. Повторяющиеся операции можно поручить системе.', project: 'Курсовед', slug: 'kursoved-pro', image: coursesImage, note: 'Программы, роли, документы и контроль обучения в одной платформе.' },
  ];
  const moreWork = ['developers-sber-ru', 'giga-chat', 'bim-sebestoimost', 'nosmoke'].flatMap((slug) => { const project = bySlug.get(slug); return project ? [project] : []; });

  return <LandingMotion><main className={styles.landing} data-business-landing>
    <section className={styles.hero} data-hero>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Разработка для бизнеса</p>
        <h1>Сайт привлекает.<br />Сервис делает остальное.</h1>
        <p className={styles.heroDescription}>Создаю сайты, приложения и автоматизации.<br />От первого впечатления до ежедневной работы.</p>
        <LeadButton className={styles.button}>Обсудить проект</LeadButton>
        <p className={styles.heroSignature}>Павел Кондратов. На связи лично.</p>
      </div>
      <div className={styles.heroGallery} aria-label="Примеры разработанных проектов">
        {urfu && <Link href="/projects/urfu-100" className={`${styles.heroScreen} ${styles.screenLeft}`}><Image src={urfu} alt="Интерактивный сайт к 100-летию УрФУ" fill sizes="(max-width: 700px) 60vw, 40vw" className={styles.cover} /></Link>}
        {careerImage && <Link href="/projects/vremya-karery" className={`${styles.heroScreen} ${styles.screenMain}`}><Image src={careerImage} alt="Карьерный портал «Время карьеры»" fill priority sizes="(max-width: 700px) 86vw, 64vw" className={styles.cover} /></Link>}
        {umnoc && <Link href="/projects/umnoc" className={`${styles.heroScreen} ${styles.screenRight}`}><Image src={umnoc} alt="Сайт УМНОЦ" fill sizes="(max-width: 700px) 60vw, 40vw" className={styles.cover} /></Link>}
      </div>
      <p className={styles.galleryCaption}>Сайты и платформы из моего портфолио.</p>
    </section>

    <section className={styles.story} id="services" data-story aria-label="Возможности для вашего бизнеса">
      <div className={styles.storyStage}>
        {story.map((item, index) => <article key={item.slug} className={styles.storyPanel} data-story-panel data-active={index === 0 ? 'true' : 'false'}>
          <div className={styles.storyCopy}><p className={styles.eyebrow}>{item.label}</p><h2>{item.title}</h2><p className={styles.storyDescription}>{item.text}</p><LeadButton className={styles.textButton}>Мне нужно похожее <span aria-hidden="true">›</span></LeadButton></div>
          <div className={styles.storyProduct}>
            <Link className={styles.storyImage} href={`/projects/${item.slug}`}>
              {item.image ? <Image src={item.image} alt={`Интерфейс проекта «${item.project}»`} fill sizes="(max-width: 899px) 90vw, 65vw" className={styles.cover} /> : <span>{item.project}</span>}
            </Link>
            <p><strong>{item.project}.</strong> {item.note}</p>
          </div>
        </article>)}
        <div className={styles.storyDots} aria-hidden="true">{story.map((item, index) => <span key={item.slug} data-story-dot data-active={index === 0 ? 'true' : 'false'} />)}</div>
      </div>
    </section>

    <section className={styles.work} id="work">
      <div className={styles.sectionHeading}><h2>Смотрите в деле.</h2><Link className={styles.textButton} href="/projects">Все проекты <span aria-hidden="true">›</span></Link></div>
      <p className={styles.sectionDescription}>Сайты, платформы и продукты, над которыми я работал.</p>
      <div className={styles.workGrid}>{selectedWork.map((item) => {
        const image = imageFor(item.slug);
        return <Link className={styles.project} href={`/projects/${item.slug}`} key={item.slug}>
          <div className={styles.projectImage}>{image ? <Image src={image} alt={`Проект «${item.title}»`} fill sizes="(max-width: 700px) 90vw, 45vw" className={styles.cover} /> : <span>{item.title}</span>}</div>
          <div className={styles.projectCopy}><p className={styles.projectType}>{item.type}</p><h3>{item.title}</h3><p>{item.text}</p><span className={styles.projectLink}>Посмотреть проект <span aria-hidden="true">›</span></span></div>
        </Link>;
      })}</div>
      {moreWork.length > 0 && <div className={styles.moreWork}><h3>А ещё —</h3><div>{moreWork.map((project) => <Link href={`/projects/${project.slug}`} key={project.slug}><strong>{project.title}</strong><span>{project.shortDescription}</span></Link>)}</div></div>}
    </section>

    <section className={styles.approach}>
      <h2>От вашей задачи.<br />До работающего решения.</h2>
      <div className={styles.steps}>
        <article><span>Обсудим</span><h3>Сначала — ваш бизнес.</h3><p>Что нужно сделать, кто будет этим пользоваться и что уже есть. Можно начать без готового технического задания.</p></article>
        <article><span>Спланируем</span><h3>Понятный объём работы.</h3><p>Определим функции, этапы, сроки и стоимость. Вы будете понимать, что получите на каждом этапе.</p></article>
        <article><span>Запустим</span><h3>Всё должно работать.</h3><p>Разработка, проверка и публикация. Покажу, как пользоваться результатом, и обсудим дальнейшее развитие.</p></article>
      </div>
    </section>

    <section className={styles.contact} id="contact">
      <p className={styles.eyebrow}>Следующий проект может быть вашим</p><h2>Давайте сделаем.</h2><p>Новый сайт, собственный сервис или меньше ручной работы?<br />Оставьте контакт — обсудим, с чего начать.</p><LeadButton className={styles.button}>Обсудить мой проект</LeadButton><a className={styles.directContact} href="mailto:i@paulislava.space">Или напишите: i@paulislava.space</a>
    </section>
    <Skills technologies={technologies} tags={tags} appearance="light" />
    <LeadInlineForm />
    <footer className={styles.footer}><Link href="/">Павел Кондратов</Link><p>Сайты, сервисы и автоматизация</p><Link href="/projects">Портфолио</Link></footer>
  </main></LandingMotion>;
}
