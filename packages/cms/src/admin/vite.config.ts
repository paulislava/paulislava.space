import type { UserConfig } from 'vite';

export default (config: UserConfig): UserConfig => ({
  ...config,
  resolve: {
    ...config.resolve,
    // Strapi's design system and the MDX editor can install separate copies.
    // CodeMirror extensions rely on instanceof checks across these packages.
    dedupe: [...(config.resolve?.dedupe ?? []), '@codemirror/state', '@codemirror/view'],
  },
});
