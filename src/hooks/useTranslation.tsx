import { createContext, useContext, useState } from "react";
import { createI18n, I18n } from "#/utils/i18n";
import { request } from "#/utils/request";

interface TranslationContextValue {
  i18n: I18n;
  changeLanguage: (language: string) => void;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export const TranslationProvider = ({
  language,
  children,
}: {
  language: string;
  children: JSX.Element;
}) => {
  const [i18n, setI18n] = useState(createI18n(language));

  const changeLanguage = (language: string) => {
    setI18n(createI18n(language));
    void request("/api/preferences/language", "PUT", { language });
  };

  return (
    <TranslationContext.Provider value={{ i18n, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const contextValue = useContext(TranslationContext);
  if (!contextValue) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  const { i18n, changeLanguage } = contextValue;

  return {
    t: i18n.translate,
    language: i18n.language,
    changeLanguage,
  };
};
