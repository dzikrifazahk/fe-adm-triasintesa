import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";
import SettingsPermissionMain from "@/components/settings/permissions/settingsPermissionMain";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function Theme({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <SettingsPermissionMain
        dictionary={dictionary?.settings_permission ?? "-"}
      />
    </>
  );
}
