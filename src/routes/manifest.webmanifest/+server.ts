import type { RequestHandler } from "@sveltejs/kit";
import manifest from "./manifest.json";
import { t } from "#/stores/i18n.svelte";

// Redirect user to the OIDC server for authentication
export const GET: RequestHandler = ({ request }) => {
  manifest.name = t("overtime_tracker");

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
};
