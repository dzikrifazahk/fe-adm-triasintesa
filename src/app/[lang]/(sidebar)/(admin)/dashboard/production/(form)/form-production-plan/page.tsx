import FormProductionPlanMain from "@/components/production/formProductionPlanPageMain";
import { getDictionary } from "../../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function ProductionPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <FormProductionPlanMain
        dictionary={dictionary.production_page_dic ?? "-"}
        lang={lang}
      />
    </>
  );
}
