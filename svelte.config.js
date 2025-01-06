import nodeAdapter from "@sveltejs/adapter-node";
import vercelAdapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess()],

  kit: {
    adapter: process.env.VERCEL ? vercelAdapter() : nodeAdapter(),
    alias: {
      "#/*": "./src/*",
    },
  },
};

export default config;
