import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import ProductionMain from "@/components/production/productionMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function ProductionPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <ProductionMain dictionary={dictionary.production_page_dic ?? "-"} />
    </>
  );
}
