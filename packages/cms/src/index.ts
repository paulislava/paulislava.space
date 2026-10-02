import { registerBannerMiddleware } from './api/footer-banner/embed';
import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) { registerBannerMiddleware(strapi); },
  bootstrap(/* { strapi } */) {},
};
