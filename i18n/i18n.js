import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationCN from "public/locales/cn/translation";
import translationEN from "public/locales/en/translation";
import translationES from "public/locales/es/translation";
import translationFR from "public/locales/fr/translation";
import translationIT from "public/locales/it/translation";
import translationPT from "public/locales/pt/translation";

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
  pt: { translation: translationPT },
  cn: { translation: translationCN },
  it: { translation: translationIT },
  fr: { translation: translationFR },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    // debug: true,
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
      wait: true,
    },
  });

export default i18n;
