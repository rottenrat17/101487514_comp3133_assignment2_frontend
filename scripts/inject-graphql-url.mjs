/**
 * Writes public/config.json from GRAPHQL_URL (set in Vercel → Environment Variables).
 * Run before `ng build` so the deployed app knows your Render API URL without hardcoding in git.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const url = (process.env.GRAPHQL_URL || '').trim();

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const payload = { graphqlUrl: url };
fs.writeFileSync(path.join(publicDir, 'config.json'), JSON.stringify(payload, null, 2) + '\n');

if (url) {
  console.log('inject-graphql-url: wrote GRAPHQL_URL to public/config.json');
} else {
  console.warn(
    'inject-graphql-url: GRAPHQL_URL is not set. For Vercel, add GRAPHQL_URL=https://YOUR-SERVICE.onrender.com/graphql in Project → Settings → Environment Variables.'
  );
}
