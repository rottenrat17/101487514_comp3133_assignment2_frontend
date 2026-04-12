import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloLink } from '@apollo/client/link';
import { setContext } from '@apollo/client/link/context';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { environment } from '../environments/environment';

// Must stay in sync with AuthService (same storage key for the JWT).
const TOKEN_KEY = 'ems_token';

function resolveGraphqlUri(): string {
  if (typeof window !== 'undefined') {
    const w = (window as unknown as { __GRAPHQL_URL__?: string }).__GRAPHQL_URL__;
    if (w && /^https?:\/\//i.test(w)) {
      return w;
    }
  }
  return environment.graphqlUrl;
}

export function createApollo(): ApolloClient.Options {
  const uploadLink = new UploadHttpLink({
    uri: resolveGraphqlUri(),
    // Bearer token is in headers, not cookies — omit avoids extra CORS rules on cross-origin (Vercel → Render).
    credentials: 'omit',
  });

  const authLink = setContext(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  return {
    link: ApolloLink.from([authLink, uploadLink]),
    cache: new InMemoryCache(),
  };
}
