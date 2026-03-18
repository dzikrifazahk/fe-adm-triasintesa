"use client";
import { createContext } from "react";

export interface MobileContextType {
  isMobile: boolean;
}

export const MobileContext = createContext<MobileContextType>({
  isMobile: false,
});