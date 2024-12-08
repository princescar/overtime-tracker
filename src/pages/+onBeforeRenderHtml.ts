import { PageContext } from "vike/types";
import { initI18n } from "#/i18n";

export const onBeforeRenderHtml = async ({ language }: PageContext) => {
  await initI18n(language);
};
