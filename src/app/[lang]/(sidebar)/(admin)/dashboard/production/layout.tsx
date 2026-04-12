import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import ProductionLayoutMain from "@/components/production/productionLayoutMain";


export default async function ProductionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <ProductionLayoutMain dictionary={dictionary?.production_page_dic ?? "-"}>
        {children}
      </ProductionLayoutMain>
    </>
  );
}
