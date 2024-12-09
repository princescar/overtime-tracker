import { usePageContext } from "vike-react/usePageContext";
import { TranslationProvider } from "#/hooks";
import en from "#/locales/en.yaml";
import zh from "#/locales/zh.yaml";

export function Layout({ children }: { children: JSX.Element }) {
  const { language } = usePageContext();

  return (
    <TranslationProvider locale={language} messages={{ en, zh }}>
      {children}
    </TranslationProvider>
  );
}
