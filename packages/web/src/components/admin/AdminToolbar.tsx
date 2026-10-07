import { getAdminStatus } from '@/lib/admin';
import RefreshButton from './RefreshButton';

interface AdminToolbarProps {
  /** Точечные теги ревалидации для текущей страницы. */
  tags?: string[];
}

/**
 * Серверный гейт: показывает fixed-кнопку «Обновить» только залогиненным
 * администраторам CMS. Рендерится в root layout → присутствует на каждой странице.
 */
export default async function AdminToolbar({ tags }: AdminToolbarProps) {
  const { isAdmin } = await getAdminStatus();
  if (!isAdmin) return null;
  return <RefreshButton tags={tags} />;
}
