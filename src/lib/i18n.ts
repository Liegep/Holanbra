import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['pt', 'en', 'es', 'nl'],
    interpolation: {
      escapeValue: false,
    },
    resources: {
      pt: {
        translation: {
          "welcome": "Bem-vindo",
          "submit": "Enviar",
          "subject": "Assunto"
        }
      },
      en: {
        translation: {
          "welcome": "Welcome",
          "submit": "Submit",
          "subject": "Subject"
        }
      },
      es: {
        translation: {
          "welcome": "Bienvenido",
          "submit": "Enviar",
          "subject": "Asunto"
        }
      },
      nl: {
        translation: {
          "welcome": "Welkom",
          "submit": "Verzenden",
          "subject": "Onderwerp"
        }
      }
    }
  });

export default i18n;
