"use client";

import { usePathname } from "next/navigation";
import { i18n, type Locale } from "../../i18n-config";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useState } from "react";

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");

  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  const handleLocaleChange = (locale: Locale) => {
    localStorage.setItem("locale", locale);
    window.location.href = redirectedPathname(locale);
  };

  useEffect(() => {
    if (!pathname) return;

    const segments = pathname.split("/");
    const locale = segments[1] as Locale;

    if (i18n.locales.includes(locale)) {
      localStorage.setItem("locale", locale);
      setCurrentLocale(locale);
    }
  }, [pathname]);

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[66px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Language</SelectLabel>
          <SelectItem className="" value="en">🇬🇧 English</SelectItem>
          <SelectItem value="id">🇮🇩 Bahasa</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
