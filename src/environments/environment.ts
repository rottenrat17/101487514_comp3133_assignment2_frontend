// Production build fallback when public/config.json has no URL (e.g. local `ng build`).
// Prefer: set GRAPHQL_URL on Vercel (see scripts/inject-graphql-url.mjs) or fill public/config.json.
export const environment = {
  production: true,
  graphqlUrl: 'http://localhost:4000/graphql',
};
