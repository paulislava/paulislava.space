import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support';

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${process.env.STRAPI_URL ?? 'http://localhost:1337'}/graphql`,
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN ?? ''}`,
      },
    }),
  });
});
