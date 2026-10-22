import { Locale } from "../../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../../get-dictionary";
import QcCoaDetail from "@/components/qc/coa/QcCoaDetail";

type Props = {
  params: Promise<{ lang: string; id: string }>;
};

export default async function QcCoaCertificateDetailPage({ params }: Props) {
  const { lang, id } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <QcCoaDetail
      coaId={id}
      dictionary={dictionary.quality_control_page_dic ?? "-"}
    />
  );
}
