import 'server-only';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export function getClient() {
  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${process.env.STRAPI_URL ?? 'https://cms.paulislava.space'}/graphql`,
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN ?? ''}`,
      },
    }),
  });
}
