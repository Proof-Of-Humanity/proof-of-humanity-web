import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from '../public/locales/en/translation.json';
import translationES from '../public/locales/es/translation.json';
import translationPT from '../public/locales/pt/translation.json';

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
  pt: { translation: translationPT}
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    // debug: true,
    interpolation: { escapeValue: false },
    react: { 
      useSuspense: false,
      wait: true
    }
  });

export default i18n;