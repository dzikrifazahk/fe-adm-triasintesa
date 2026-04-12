import SettingsProductsMain from "@/components/settings/products/settingsProductsMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function ProductsPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <SettingsProductsMain dictionary={dictionary?.settings_products ?? "-"} />
    </>
  );
}
