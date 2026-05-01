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
          "subject": "Assunto",
          "dashboard": "Painel de Controle",
          "rentals": "Meus Aluguéis",
          "support": "Suporte"
        }
      },
      en: {
        translation: {
          "welcome": "Welcome",
          "submit": "Submit",
          "subject": "Subject",
          "dashboard": "Dashboard",
          "rentals": "My Rentals",
          "support": "Support"
        }
      },
      es: {
        translation: {
          "welcome": "Bienvenido",
          "submit": "Enviar",
          "subject": "Asunto",
          "dashboard": "Panel de Control",
          "rentals": "Mis Alquileres",
          "support": "Soporte"
        }
      },
      nl: {
        translation: {
          "welcome": "Welkom",
          "submit": "Verzenden",
          "subject": "Onderwerp",
          "dashboard": "Dashboard",
          "rentals": "Mijn Verhuur",
          "support": "Ondersteuning"
        }
      }
    }
  });

export default i18n;
