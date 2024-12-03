import { PageContext } from "vike/types";
import { initI18n } from "#/i18n";

import "./tailwind.css";

export const onBeforeRenderClient = async ({ language }: PageContext) => {
  await initI18n(language);
};
