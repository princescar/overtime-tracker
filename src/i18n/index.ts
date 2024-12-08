import i18n from "i18next";
import en from "./en.json";
import zh from "./zh.json";

export const initI18n = async (lng = "en") => {
  await i18n.init({
    resources: { en, zh },
    lng,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
};

export default i18n;
