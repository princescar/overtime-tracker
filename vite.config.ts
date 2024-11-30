import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import vike from "vike/plugin";
import { hattip } from "@hattip/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vike(),
    hattip({
      clientConfig: {
        build: {
          target: "esnext",
        },
      },
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
      "#": path.resolve(__dirname, "./"),
    },
  },
});
