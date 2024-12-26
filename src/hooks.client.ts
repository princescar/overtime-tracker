import type { ClientInit } from "@sveltejs/kit";
import { i18nStore } from "#/stores/i18n.svelte";

export const init: ClientInit = async () => {
  // Initailize to the same language as server side renderred
  const language = document.querySelector("html")?.getAttribute("lang") ?? "en";
  await i18nStore.load(language);
};

export const handleError = (error: Error) => {
  console.error(error);
};
