import SettingsPublicationCategoryMain from "@/components/settings/publication-category/settingsPublicationCategoryMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function PublicationCategoryPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <SettingsPublicationCategoryMain
        dictionary={dictionary?.settings_publication_category ?? "-"}
      />
    </>
  );
}
