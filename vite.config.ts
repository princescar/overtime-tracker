import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import vike from "vike/plugin";
import { hattip } from "@hattip/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vike(),
    hattip({
      serverConfig: {
        build: {
          target: "esnext",
          cssTarget: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
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
