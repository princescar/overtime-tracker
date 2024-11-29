import React from "react";
import { I18nextProvider } from "react-i18next";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import i18n from "#/i18n";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <MantineProvider>
        <Notifications />
        {children}
      </MantineProvider>
    </I18nextProvider>
  );
}
