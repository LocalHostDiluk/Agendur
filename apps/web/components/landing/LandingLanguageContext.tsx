"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
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
  const lang = useSyncExternalStore<Language>(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("agendur-language", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("agendur-language", onChange);
      };
    },
    () => {
      const saved = localStorage.getItem("agendur_lang");
      return saved === "en" ? "en" : "es";
    },
    () => "es",
  );

  const setLang = (newLang: Language) => {
    try {
      localStorage.setItem("agendur_lang", newLang);
      window.dispatchEvent(new Event("agendur-language"));
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
