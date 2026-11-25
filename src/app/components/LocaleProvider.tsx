"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { translate, type Locale } from "../lib/translations";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (source: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export default function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setCurrentLocale] = useState(initialLocale);

  function setLocale(nextLocale: Locale) {
    setCurrentLocale(nextLocale);
    document.cookie = `kinlive-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";
  }

  const value = {
    locale,
    setLocale,
    t: (source: string) => translate(locale, source),
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}