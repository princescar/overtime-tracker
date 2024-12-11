import acceptLanguageParser from "accept-language";
import Messages from "@messageformat/runtime/messages";
import en from "#/locales/en.yaml";
import zh from "#/locales/zh.yaml";

export interface I18n {
  readonly language: string;
  translate: (id: string, props?: Record<string, unknown>) => string;
}

const messagesData = { en, zh };
const supportedLanguages = Object.keys(messagesData);
const defaultLanguage = supportedLanguages[0];
acceptLanguageParser.languages(supportedLanguages);

export const isLanguageSupported = (language?: string | null) =>
  supportedLanguages.includes(language?.toLowerCase() ?? "");

export const detectLanguage = (
  acceptLanguage?: string | null,
  preferredLanguage?: string | null,
) => {
  let language = preferredLanguage;

  if (!isLanguageSupported(language)) {
    language = acceptLanguageParser.get(acceptLanguage);
  }

  if (!isLanguageSupported(language)) {
    language = defaultLanguage;
  }

  return language;
};

export const createI18n = (language: string) => {
  if (!isLanguageSupported(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const messages = new Messages(messagesData, defaultLanguage);
  messages.locale = language;

  return {
    language: messages.locale,
    translate: (id: string, props?: Record<string, unknown>) =>
      messages.get(id, props) as string,
  };
};
