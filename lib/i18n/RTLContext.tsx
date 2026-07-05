import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from 'i18next';
import { isRTLLanguage } from './rtl';

interface RTLContextValue {
  isRTL: boolean;
}

const RTLContext = createContext<RTLContextValue>({ isRTL: isRTLLanguage(i18n.language) });

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const [isRTL, setIsRTL] = useState(() => isRTLLanguage(i18n.language));

  useEffect(() => {
    const handleLanguageChanged = (language: string) => {
      setIsRTL(isRTLLanguage(language));
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return <RTLContext.Provider value={{ isRTL }}>{children}</RTLContext.Provider>;
}

export function useRTL() {
  return useContext(RTLContext);
}
