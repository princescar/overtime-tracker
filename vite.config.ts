import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { hattip } from "@hattip/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    vike(),
    hattip({
      serverConfig: {
        build: {
          target: "esnext",
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
