import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import pt from '../locales/pt.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import nl from '../locales/nl.json';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    lng: 'pt',
    supportedLngs: ['pt', 'en', 'es', 'nl'],
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
  });

export default i18n;
