import { getAdminStatus, contentManagerEditUrl } from '@/lib/admin';

interface AdminEditButtonProps {
  /** Content-type UID главной сущности страницы, например `api::project.project`. */
  uid: string;
  documentId: string;
}

/**
 * Серверный гейт: fixed-кнопка «Редактировать» для администратора, ведущая
 * на страницу сущности в content-manager Strapi. Ставится над кнопкой «Обновить».
 */
export default async function AdminEditButton({ uid, documentId }: AdminEditButtonProps) {
  const { isAdmin } = await getAdminStatus();
  if (!isAdmin) return null;

  return (
    <a
      href={contentManagerEditUrl(uid, documentId)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Редактировать в CMS"
      className="fixed bottom-24 right-6 z-50 flex items-center gap-2 rounded-full border border-[#6366f1]/40 bg-[#0a0a0f]/90 px-4 py-3 font-mono text-sm text-[#f1f5f9] shadow-lg shadow-black/40 backdrop-blur transition-colors hover:border-[#06b6d4] hover:text-[#06b6d4]"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
      <span>Редактировать</span>
    </a>
  );
}
