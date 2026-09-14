"use client";

import React, { createContext, useContext, useState } from "react";

interface AuthBrandCopy {
  headline?: string;
  subheadline?: string;
}

interface AuthBrandContextType {
  copy: AuthBrandCopy;
  setCopy: (copy: AuthBrandCopy) => void;
}

const AuthBrandContext = createContext<AuthBrandContextType>({
  copy: {},
  setCopy: () => {},
});

export function AuthBrandProvider({ children }: { children: React.ReactNode }) {
  const [copy, setCopy] = useState<AuthBrandCopy>({});

  return (
    <AuthBrandContext.Provider value={{ copy, setCopy }}>
      {children}
    </AuthBrandContext.Provider>
  );
}

export function useAuthBrand() {
  return useContext(AuthBrandContext);
}
