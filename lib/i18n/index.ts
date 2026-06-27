import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, Platform } from 'react-native';

import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

const LANGUAGE_KEY = 'app.language';
const RTL_LANGUAGES = new Set(['ar']);

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

const normalizeLanguage = (languageTag?: string | null) => {
  if (!languageTag) return 'en';
  return languageTag.split('-')[0].toLowerCase();
};

const getDeviceLanguage = () => {
  const locale = Localization.getLocales?.()[0]?.languageTag || 'en';
  return normalizeLanguage(locale);
};

const setRtl = (language: string) => {
  const isRtl = RTL_LANGUAGES.has(language);
  if (Platform.OS === 'web') {
    I18nManager.allowRTL(isRtl);
    return;
  }
  if (I18nManager.isRTL !== isRtl) {
    I18nManager.allowRTL(isRtl);
    I18nManager.forceRTL(isRtl);
  }
};

let initialized = false;

export const initI18n = async () => {
  if (initialized) return i18n;

  const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  const language = storedLanguage || getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

  setRtl(language);
  initialized = true;

  return i18n;
};

export const setLanguage = async (language: string) => {
  const normalized = normalizeLanguage(language);
  await i18n.changeLanguage(normalized);
  await AsyncStorage.setItem(LANGUAGE_KEY, normalized);
  setRtl(normalized);
};

export default i18n;
