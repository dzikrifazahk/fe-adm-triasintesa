import SettingsContactMain from "@/components/settings/contact/settingsContactMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Contact({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <SettingsContactMain dictionary={dictionary?.settings_contact ?? "-"} />
    </>
  );
}
