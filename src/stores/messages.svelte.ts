import Messages, { type MessageData } from "@messageformat/runtime/messages";
import { isLanguageSupported } from "#/utils/i18n";

export interface I18n {
  readonly language: string;
  translate: (id: string, props?: Record<string, unknown>) => string;
}

let messages = $state<Messages>();

const loadMessages = async (language: string) => {
  if (!isLanguageSupported(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Split the language resources into multiple chunks and load them on demand
  const messageData = (await import(`#/messages/${language}.yaml`)) as { default: MessageData };

  messages = new Messages({ [language]: messageData.default }, language);
};

export const t = (id: string, props?: Record<string, unknown>) => {
  if (!messages) {
    throw new Error("Messages not loaded");
  }

  return messages.get(id, props) as string | undefined;
};

export const language = () => {
  if (!messages) {
    throw new Error("Messages not loaded");
  }

  return messages.locale;
};

export const changeLanguage = async (language: string) => {
  if (language === messages?.locale) {
    return;
  }
  await loadMessages(language);
};
