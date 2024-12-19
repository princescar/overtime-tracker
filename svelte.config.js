import nodeAdapter from "@sveltejs/adapter-node";
import vercelAdapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { preprocessMeltUI, sequence } from "@melt-ui/pp";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: sequence([vitePreprocess(), preprocessMeltUI()]),

  kit: {
    adapter: process.env.VERCEL ? vercelAdapter() : nodeAdapter(),
    alias: {
      "#/*": "./src/*",
    },
  },
};

export default config;
