import SettingsPublicationMain from "@/components/settings/publications/settingsPublicationMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function PublicationsPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <SettingsPublicationMain dictionary={dictionary?.settings_publication ?? "-"} />
    </>
  );
}
