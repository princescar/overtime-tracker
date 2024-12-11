import { createContext, useContext } from "react";
import { createI18n, I18n } from "#/utils/i18n";

const TranslationContext = createContext<I18n | null>(null);

export const TranslationProvider = ({
  language,
  children,
}: {
  language: string;
  children: JSX.Element;
}) => {
  const i18n = createI18n(language);

  return (
    <TranslationContext.Provider value={i18n}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const i18n = useContext(TranslationContext);
  if (!i18n) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return {
    t: i18n.translate,
  };
};
