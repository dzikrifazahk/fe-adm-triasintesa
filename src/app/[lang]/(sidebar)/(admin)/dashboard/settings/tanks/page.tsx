import SettingsTanksMain from "@/components/settings/tanks/settingsTanksMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function TanksPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <SettingsTanksMain dictionary={dictionary?.settings_tanks ?? "-"} />
    </>
  );
}
