
import SettingsRolesMain from "@/components/settings/roles/settingsRolesMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function RolesPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <SettingsRolesMain
        dictionary={dictionary?.settings_roles ?? "-"}
      />
    </>
  );
}
