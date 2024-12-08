import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { hattip } from "@hattip/vite";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  build: {
    cssTarget: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
  },
  plugins: [
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
  resolve: {
    alias: {
      "#": path.resolve(__dirname, "./src"),
    },
  },
});
