import { fileURLToPath } from "url";
import { readdirSync } from "fs";
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { messageformat } from "rollup-plugin-messageformat";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const messagesFolder = new URL("./src/messages/", import.meta.url);
const supportedLanguages = readdirSync(messagesFolder)
  .filter((file) => file.endsWith(".yaml"))
  .map((file) => file.replace(/\.yaml$/, ""));

export default defineConfig({
  plugins: [
    messageformat({
      include: fileURLToPath(new URL("*.yaml", messagesFolder)),
      locales: supportedLanguages,
    }),
    sveltekit(),
  ],
  server: {
    port: 3000,
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
});
