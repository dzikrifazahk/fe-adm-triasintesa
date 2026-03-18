import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";
import SettingsUsersMain from "@/components/settings/users/settingsUsersMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Users({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <SettingsUsersMain dictionary={dictionary?.settings_users ?? "-"} />
    </>
  );
}