import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { en } from './en';
import type { Translation } from './en';
import { ja } from './ja';

type Language = 'en' | 'ja';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const translations: Record<Language, Translation> = {
  en,
  ja,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ja'); // デフォルトは日本語

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}
