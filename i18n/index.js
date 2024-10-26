import i18n from 'i18next';
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import uk from '../locales/uk.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initReactI18next } from 'react-i18next';

const getLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem('lang');
  return savedLanguage || 'en';
};

const initializeI18n = async () => {
  const language = await getLanguage();
  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    lng: language,
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uk: { translation: uk },
    },
    interpolation: { escapeValue: false },
  });
};

export { i18n, initializeI18n };
