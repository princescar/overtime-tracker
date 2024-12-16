import acceptLanguageParser from "accept-language";

const supportedLanguages = ["en", "zh"]; // TODO: inject in build time
const defaultLanguage = supportedLanguages[0];
acceptLanguageParser.languages(supportedLanguages);

export const isLanguageSupported = (language?: string | null) =>
  supportedLanguages.includes(language?.toLowerCase() ?? "");

export const detectLanguage = (
  acceptLanguage?: string | null,
  preferredLanguage?: string | null,
): string => {
  let language = preferredLanguage;

  if (!isLanguageSupported(language)) {
    language = acceptLanguageParser.get(acceptLanguage);
  }

  if (!isLanguageSupported(language)) {
    language = defaultLanguage;
  }

  return language ?? defaultLanguage;
};
