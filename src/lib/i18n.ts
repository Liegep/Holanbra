import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pt from '../locales/pt.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import nl from '../locales/nl.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    lng: 'pt', 
    supportedLngs: ['pt', 'en', 'es', 'nl'],
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
      nl: { translation: nl },
    },
    defaultNS: 'translation',
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
    }
  });

export default i18n;
