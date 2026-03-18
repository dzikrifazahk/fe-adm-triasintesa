import SettingsDivisionsMain from "@/components/settings/divisions/settingsDivisionsMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Divisions({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);


  return (
    <>
      <SettingsDivisionsMain
        dictionary={dictionary?.settings_divisions ?? "-"}
      />
    </>
  );
}
