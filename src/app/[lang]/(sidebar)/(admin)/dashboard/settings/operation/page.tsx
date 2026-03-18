import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";
import SettingsOperationMain from "@/components/settings/operation/settingsOperationMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Divisions({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <SettingsOperationMain
        dictionary={dictionary?.settings_operation ?? "-"}
      />
    </>
  );
}
