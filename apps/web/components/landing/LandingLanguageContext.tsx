"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [lang, setLangState] = useState<Language>("es");

  useEffect(() => {
    const saved = localStorage.getItem("agendur_lang") as Language | null;
    if (saved === "es" || saved === "en") {
      setLangState(saved);
    }
  }, []);

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
