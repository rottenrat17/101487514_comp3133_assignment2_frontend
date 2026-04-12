// Dev server: browser calls /graphql on port 4200; Angular proxies that to the API (see proxy.conf.json).
export const environment = {
  production: false,
  graphqlUrl: '/graphql',
};
