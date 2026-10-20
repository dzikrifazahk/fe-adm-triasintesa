"use client";

import { usePathname } from "next/navigation";
import { formText, type FormLocale, type FormText } from "@/locales/form-text";

/** Locale aktif diambil dari segmen pertama URL (/id/... atau /en/...). */
export function useFormLocale(): FormLocale {
  const pathname = usePathname() ?? "";
  const segment = pathname.split("/")[1];
  return segment === "en" ? "en" : "id";
}

/** Teks label & placeholder input field sesuai locale aktif. */
export function useFormText(): FormText {
  return formText[useFormLocale()];
}
