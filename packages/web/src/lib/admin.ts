import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';

// Имя сессионной refresh-cookie админки Strapi. Расшарена на *.paulislava.space
// (см. packages/cms/config/admin.ts), поэтому доходит и до paulislava.space.
const REFRESH_COOKIE_NAME = 'strapi_admin_refresh';

// URL для серверной проверки токена (может быть внутренним адресом).
const STRAPI_URL = process.env.STRAPI_URL || 'https://cms.paulislava.space';

// Публичный адрес CMS для ссылок «Редактировать», которые открывает браузер.
export const CMS_PUBLIC_URL =
  process.env.CMS_PUBLIC_URL || 'https://cms.paulislava.space';

export interface AdminStatus {
  isAdmin: boolean;
  user?: {
    id: number;
    firstname: string | null;
    lastname: string | null;
    email: string;
  };
}

const NOT_ADMIN: AdminStatus = { isAdmin: false };

/**
 * Проверяет, залогинен ли текущий посетитель как администратор CMS.
 * Читает расшаренную refresh-cookie и валидирует её через cms.paulislava.space/api/auth.
 * Мемоизируется на время запроса (React cache), поэтому layout и страницы
 * могут звать её независимо без лишних сетевых обращений.
 */
export const getAdminStatus = cache(async (): Promise<AdminStatus> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  if (!token) return NOT_ADMIN;

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth`, {
      headers: {
        // Пересылаем cookie серверным запросом; браузер сюда не участвует.
        Cookie: `${REFRESH_COOKIE_NAME}=${token}`,
      },
      // Админ-статус нельзя кешировать — он привязан к конкретному посетителю.
      cache: 'no-store',
    });
    if (!res.ok) return NOT_ADMIN;
    const data = (await res.json()) as AdminStatus;
    return data?.isAdmin ? data : NOT_ADMIN;
  } catch {
    return NOT_ADMIN;
  }
});

export async function isAdmin(): Promise<boolean> {
  return (await getAdminStatus()).isAdmin;
}

/**
 * Ссылка на редактирование сущности в content-manager Strapi.
 * @param uid content-type UID, например `api::project.project`
 */
export function contentManagerEditUrl(uid: string, documentId: string): string {
  return `${CMS_PUBLIC_URL}/admin/content-manager/collection-types/${uid}/${documentId}`;
}
