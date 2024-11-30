import React from "react";
import { I18nextProvider } from "react-i18next";
import { ToastProvider } from "#/hooks/useToaster";
import i18n from "#/i18n";

import "tailwindcss/index.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ToastProvider>{children}</ToastProvider>
    </I18nextProvider>
  );
}
