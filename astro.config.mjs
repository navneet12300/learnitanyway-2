import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://learn-it-anyway.vercel.app',
  integrations: [tailwind()],
});
