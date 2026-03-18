import SettingsThemeMain from "@/components/settings/theme/settingsThemeMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Theme({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <SettingsThemeMain dictionary={dictionary?.settings_theme ?? "-"} />
    </>
  );
}