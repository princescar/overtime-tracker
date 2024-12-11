import { usePageContext } from "vike-react/usePageContext";
import { TranslationProvider } from "#/hooks/useTranslation";
import { ToastProvider } from "#/hooks/useToaster";
import en from "#/locales/en.yaml";
import zh from "#/locales/zh.yaml";

import "./index.css";

export function Layout({ children }: { children: JSX.Element }) {
  const { language } = usePageContext();

  return (
    <TranslationProvider locale={language} messages={{ en, zh }}>
      <ToastProvider>{children}</ToastProvider>
    </TranslationProvider>
  );
}
