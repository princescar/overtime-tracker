import acceptLanguageParser from "accept-language";

// Wrap it in function as dev server would inject this value after the top level execution sometimes
const getSupportedLanguages = () => __SUPPORTED_LANGUAGES__;

export const isLanguageSupported = (language: string) =>
  getSupportedLanguages().includes(language.toLowerCase());

export const detectLanguage = (
  acceptLanguage?: string | null,
  preferredLanguage?: string | null,
): string => {
  let language = preferredLanguage;

  if (!language || !isLanguageSupported(language)) {
    const supportedLanguages = getSupportedLanguages();
    acceptLanguageParser.languages(supportedLanguages);
    language = acceptLanguageParser.get(acceptLanguage);
    language ??= supportedLanguages[0];
  }

  return language;
};
