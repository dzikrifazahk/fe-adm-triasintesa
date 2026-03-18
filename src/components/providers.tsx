// app/providers.tsx
"use client";

import React from "react";
import { ThemeProvider } from "next-themes";

import { MobileContext } from "@/hooks/use-mobile-ssr";
import { LoadingProvider } from "@/context/loadingContext";

interface Props {
  isMobile: boolean;
  children: React.ReactNode;
}

export function ClientProviders({ isMobile, children }: Props) {
  return (
    <LoadingProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        storageKey="theme"
      >
        <MobileContext.Provider value={{ isMobile }}>
          {children}
        </MobileContext.Provider>
      </ThemeProvider>
    </LoadingProvider>
  );
}
