import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloLink } from '@apollo/client/link';
import { setContext } from '@apollo/client/link/context';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { environment } from '../environments/environment';

// Must stay in sync with AuthService (same storage key for the JWT).
const TOKEN_KEY = 'ems_token';

export function createApollo(): ApolloClient.Options {
  const uploadLink = new UploadHttpLink({
    uri: environment.graphqlUrl,
    credentials: 'include',
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
