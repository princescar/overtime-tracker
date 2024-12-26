import Messages, { type MessageData } from "@messageformat/runtime/messages";
import { isLanguageSupported } from "#/utils/i18n";

class I18nStore {
  #messages = $state<Messages>();

  get language() {
    return this.#messages?.locale;
  }

  async load(language: string) {
    if (language === this.#messages?.locale) {
      return;
    }
    if (!isLanguageSupported(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Split the language resources into multiple chunks and load them on demand
    const messageData = (await import(`#/messages/${language}.yaml`)) as { default: MessageData };

    this.#messages = new Messages({ [language]: messageData.default }, language);
  }

  t(id: string, props?: Record<string, unknown>) {
    if (!this.#messages) {
      throw new Error("Messages not loaded");
    }

    return this.#messages.get(id, props) as string;
  }
}

export const i18nStore = new I18nStore();
export const t = i18nStore.t.bind(i18nStore);
