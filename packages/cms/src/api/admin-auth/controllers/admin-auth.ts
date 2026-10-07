/**
 * Публичная ручка проверки админ-статуса для внешних клиентов (Next на paulislava.space).
 *
 * Читает сессионную refresh-cookie админки (`strapi_admin_refresh`), которую Strapi
 * выставляет при логине в cms.paulislava.space. Благодаря admin.auth.cookie.domain
 * cookie расшарена на все *.paulislava.space, поэтому Next может переслать её сюда
 * серверным запросом и узнать, залогинен ли администратор.
 *
 * Отдаёт только факт админства и минимальный публичный профиль — никаких токенов наружу.
 */

// Имя refresh-cookie админки в Strapi 5 (@strapi/admin session-auth).
const REFRESH_COOKIE_NAME = 'strapi_admin_refresh';

interface AdminAuthResult {
  isAdmin: boolean;
  user?: {
    id: number;
    firstname: string | null;
    lastname: string | null;
    email: string;
  };
}

export default {
  async check(ctx) {
    const notAdmin: AdminAuthResult = { isAdmin: false };

    const token = ctx.cookies.get(REFRESH_COOKIE_NAME);
    if (!token) {
      ctx.body = notAdmin;
      return;
    }

    const sessionManager = strapi.sessionManager;
    if (!sessionManager) {
      ctx.body = notAdmin;
      return;
    }

    const result = await sessionManager('admin').validateRefreshToken(token);
    if (!result.isValid || !result.userId) {
      ctx.body = notAdmin;
      return;
    }

    const user = await strapi.db.query('admin::user').findOne({
      where: { id: result.userId },
      select: ['id', 'firstname', 'lastname', 'email', 'isActive', 'blocked'],
    });

    if (!user || user.blocked || user.isActive === false) {
      ctx.body = notAdmin;
      return;
    }

    ctx.body = {
      isAdmin: true,
      user: {
        id: user.id,
        firstname: user.firstname ?? null,
        lastname: user.lastname ?? null,
        email: user.email,
      },
    } satisfies AdminAuthResult;
  },
};
