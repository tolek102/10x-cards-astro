// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap(), tailwind()],
  server: { port: 3000 },
  vite: {
    envPrefix: ["SUPABASE_", "PUBLIC_"],
  },
  adapter: cloudflare(),
  experimental: {
    session: true,
  },
});