"use client";

import { createContext, useContext } from "react";

interface LenisContextType {
  scrollTo: (target: HTMLElement | string | number) => void;
}

const LenisContext = createContext<LenisContextType>({
  scrollTo: (target) => {
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth" });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  },
});

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const scrollTo = (target: HTMLElement | string | number) => {
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth" });
    } else if (typeof target === "string") {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  return (
    <LenisContext.Provider value={{ scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}

export function useLenis() {
  return useContext(LenisContext);
}
