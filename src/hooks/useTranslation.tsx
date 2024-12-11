import { createContext, useContext } from "react";
import Messages, { MessageData } from "@messageformat/runtime/messages";

interface TranslationContextValue {
  locale: string;
  messagesObject: Messages;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export const TranslationProvider = ({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Record<string, MessageData>;
  children: JSX.Element;
}) => {
  const messagesObject = new Messages(messages, locale);

  return (
    <TranslationContext.Provider value={{ locale, messagesObject }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const contextValue = useContext(TranslationContext);
  if (!contextValue) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  const { locale, messagesObject } = contextValue;

  const t = (id: string, props?: Record<string, unknown>) =>
    messagesObject.get(id, props, locale) as string;

  return { t };
};
