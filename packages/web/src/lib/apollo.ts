import 'server-only';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export interface NextCacheOptions {
  tags?: string[];
  revalidate?: number;
}

const STRAPI_URL = process.env.STRAPI_URL || 'https://cms.paulislava.space';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

export function getClient(cache?: NextCacheOptions) {
  const customFetch: typeof fetch = (uri, options = {}) =>
    fetch(uri, { ...options, next: cache } as RequestInit);

  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${STRAPI_URL}/graphql`,
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      fetch: customFetch,
    }),
  });
}
