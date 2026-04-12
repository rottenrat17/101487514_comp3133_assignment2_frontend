// Production / Vercel: must be your live API (https). Never use localhost here — the browser would call the user’s PC, not Render.
// Replace the host below with your Render Web Service URL (Dashboard → copy URL, no trailing slash) + /graphql
export const environment = {
  production: true,
  graphqlUrl: 'https://YOUR-RENDER-SUBDOMAIN.onrender.com/graphql',
};
