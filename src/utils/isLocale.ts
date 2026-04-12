import { i18n } from "../../i18n-config";

export function isLocale(value: string): value is "en" | "id" {
  return (i18n.locales as readonly string[]).includes(value);
}
