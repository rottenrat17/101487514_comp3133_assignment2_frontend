import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

declare global {
  interface Window {
    __GRAPHQL_URL__?: string;
  }
}

async function bootstrap(): Promise<void> {
  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    if (res.ok) {
      const cfg = (await res.json()) as { graphqlUrl?: string };
      const u = cfg?.graphqlUrl?.trim();
      if (u && /^https?:\/\//i.test(u)) {
        window.__GRAPHQL_URL__ = u;
      }
    }
  } catch {
    // Missing config.json — graphql.provider falls back to environment.ts
  }
  await bootstrapApplication(AppComponent, appConfig);
}

bootstrap().catch((err) => console.error(err));
