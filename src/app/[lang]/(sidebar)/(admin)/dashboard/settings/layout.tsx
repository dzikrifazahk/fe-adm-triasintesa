import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import { MenuBar } from "@/components/settings/menuBar";

export default async function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <MenuBar dictionary={dictionary?.menu_bar_settings ?? "-"}>
        {children}
      </MenuBar>
    </>
  );
}
