const RTL_LANGUAGES = new Set(['ar']);

export const isRTLLanguage = (language?: string | null): boolean => {
  if (!language) return false;
  return RTL_LANGUAGES.has(language.split('-')[0].toLowerCase());
};
