import Link from 'next/link';
import NotFoundLeadForm from '@/components/business/NotFoundLeadForm';
import styles from './not-found.module.css';

export default function NotFound() {
  return <main data-not-found className={styles.page}>
    <div className={styles.inner}>
      <div className={styles.copy}>
        <p className={styles.kicker}><span aria-hidden="true" /> Ошибка 404</p>
        <p className={styles.number} aria-hidden="true">404</p>
        <h1>Этой страницы нет.</h1>
        <p className={styles.description}>Посмотрите мои работы или расскажите, что хотите создать. Я помогу найти решение для вашего проекта.</p>
        <div className={styles.links}>
          <Link href="/projects">Смотреть работы <span aria-hidden="true">↗</span></Link>
          <Link href="/">На главную</Link>
        </div>
      </div>
      <NotFoundLeadForm />
    </div>
    <p className={styles.footer}>Павел Кондратов <span>Сайты, сервисы и автоматизация</span></p>
  </main>;
}
