import { Locale } from "../../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../../get-dictionary";
import QcInspectionDetail from "@/components/qc/inspections/QcInspectionDetail";

type Props = {
  params: Promise<{ lang: Locale; id: string }>;
};

export default async function QcInspectionDetailPage({ params }: Props) {
  const { lang, id } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <QcInspectionDetail
      inspectionId={id}
      dictionary={dictionary.quality_control_page_dic ?? "-"}
    />
  );
}
