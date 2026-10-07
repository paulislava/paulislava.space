import { registerBannerMiddleware } from './api/footer-banner/embed';
import { registerVodomerRevalidation } from './api/vodomer-page/revalidate';
import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) { registerBannerMiddleware(strapi); registerVodomerRevalidation(strapi); },
  bootstrap(/* { strapi } */) {},
};
