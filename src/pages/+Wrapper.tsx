import { usePageContext } from "vike-react/usePageContext";
import { TranslationProvider } from "#/hooks/useTranslation";

export const Wrapper = ({ children }: { children: JSX.Element }) => {
  const { language } = usePageContext();

  return (
    <TranslationProvider language={language}>{children}</TranslationProvider>
  );
};
