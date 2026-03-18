import DefaultSettingsPage from "@/components/settings/defaultSettingsPage";
import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";

export default async function Settings(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <DefaultSettingsPage dictionary={dictionary?.menu_bar_settings ?? "-"} />
    </>
  );
}
