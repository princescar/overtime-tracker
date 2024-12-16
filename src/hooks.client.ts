import type { ClientInit } from "@sveltejs/kit";
import { changeLanguage } from "#/stores/messages.svelte";

export const init: ClientInit = async () => {
  // Initailize to the same language as server side renderred
  const language = document.querySelector("html")?.getAttribute("lang") ?? "en";
  await changeLanguage(language);
};

export const handleError = (error: Error) => {
  console.error(error);
};
