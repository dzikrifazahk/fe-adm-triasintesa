import SettingsTaxMain from "@/components/settings/taxs/settingsTaxMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Tax({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <SettingsTaxMain dictionary={dictionary?.settings_tax ?? "-"} />
    </>
  );
}
