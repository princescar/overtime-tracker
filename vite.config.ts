import { fileURLToPath } from "url";
import { readdirSync } from "fs";
import { defineConfig, type PluginOption } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { messageformat } from "rollup-plugin-messageformat";
import tailwindcss from "@tailwindcss/vite";

const messagesFolder = new URL("./src/messages/", import.meta.url);
const supportedLanguages = readdirSync(messagesFolder)
  .filter((file) => file.endsWith(".yaml"))
  .map((file) => file.replace(/\.yaml$/, ""));

export default defineConfig({
  define: {
    __SUPPORTED_LANGUAGES__: supportedLanguages, // Inject supported languages in build time
  },
  plugins: [
    messageformat({
      include: fileURLToPath(new URL("*.yaml", messagesFolder)),
      locales: supportedLanguages,
    }) as unknown as PluginOption,
    sveltekit(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
});
