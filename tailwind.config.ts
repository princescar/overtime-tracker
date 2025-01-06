import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import flowbite from "flowbite/plugin";

export default {
  content: [
    "./src/**/*.{html,svelte,ts}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte-icons/**/*.{html,js,svelte,ts}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: colors.emerald,
      },
    },
  },
  plugins: [flowbite],
} satisfies Config;
