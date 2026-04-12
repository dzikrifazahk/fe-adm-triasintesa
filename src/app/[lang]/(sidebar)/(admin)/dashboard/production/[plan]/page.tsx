import ProductionPlanDetailMain from "@/components/production/productionPlanDetailMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale; plan: string }>;
};

export default async function ProductionPlanDetailPage({ params }: Props) {
  const { lang, plan } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <ProductionPlanDetailMain
      dictionary={dictionary.production_page_dic ?? "-"}
      planId={plan}
    />
  );
}
