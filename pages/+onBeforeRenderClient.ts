import { PageContext } from "vike/types";
import { initI18n } from "#/i18n";

export const onBeforeRenderClient = async ({ language }: PageContext) => {
  await initI18n(language);
};
