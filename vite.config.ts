import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { hattip } from "@hattip/vite";

export default defineConfig({
  plugins: [react(), vike(), hattip()],
});
