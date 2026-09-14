"use client";

import React, { createContext, useContext, useState } from "react";
import { Language, landingCopy } from "@/lib/landing-i18n";

interface LandingLanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof landingCopy)["es"];
}

const LandingLanguageContext = createContext<
  LandingLanguageContextType | undefined
>(undefined);

export function LandingLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === "undefined") return "es";
    try {
      const saved = localStorage.getItem("agendur_lang") as Language | null;
      return saved === "es" || saved === "en" ? saved : "es";
    } catch {
      return "es";
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("agendur_lang", newLang);
    } catch {}
  };

  const t = landingCopy[lang];

  return (
    <LandingLanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LandingLanguageContext.Provider>
  );
}

export function useLandingLanguage() {
  const context = useContext(LandingLanguageContext);
  if (!context) {
    throw new Error(
      "useLandingLanguage must be used within a LandingLanguageProvider",
    );
  }
  return context;
}
