"use client";
import { createContext, useContext, useState } from "react";
import GlobalLoader from "../components/globalLoader";

interface LoadingContextProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(
  undefined
);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && (
        <div
          className="fixed top-0 left-0 w-full h-full min-h-screen z-50 flex items-center justify-center
    bg-white/20 dark:bg-black/10 backdrop-blur-xs backdrop-brightness-90"
        >
          <GlobalLoader />
        </div>
      )}
    </LoadingContext.Provider>
  );
}
