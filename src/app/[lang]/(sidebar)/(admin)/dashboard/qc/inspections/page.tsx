import { Locale } from "../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../get-dictionary";
import QcInspectionList from "@/components/qc/inspections/QcInspectionList";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function QcInspectionsPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <QcInspectionList
      dictionary={dictionary.quality_control_page_dic ?? "-"}
    />
  );
}
