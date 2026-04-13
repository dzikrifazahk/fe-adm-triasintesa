import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import QCMain from "@/components/qc/qcMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function ShippingPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <QCMain dictionary={dictionary.quality_control_page_dic ?? "-"} />
    </>
  );
}
