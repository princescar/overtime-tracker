import path from "path";
import { defineConfig } from "vite";
import { messageformat } from "rollup-plugin-messageformat";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { hattip } from "@hattip/vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [
    messageformat({
      include: path.resolve(__dirname, "./src/locales/**/*.yaml"),
      locales: ["en"],
    }),
    react(),
    vike(),
    hattip({
      serverConfig: {
        build: {
          target: "esnext",
        },
        ssr: {
          noExternal: true,
        },
      },
    }),
  ],
  build: {
    cssTarget: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      "#": path.resolve(__dirname, "./src"),
    },
  },
});
