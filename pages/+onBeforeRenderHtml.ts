import { PageContext } from "vike/types";
import { initI18n } from "#/i18n";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

export const onBeforeRenderHtml = async ({ language }: PageContext) => {
  await initI18n(language);
};
