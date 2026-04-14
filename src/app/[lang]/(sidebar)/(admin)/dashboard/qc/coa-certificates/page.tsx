import { Locale } from "../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../get-dictionary";
import QcCoaList from "@/components/qc/coa/QcCoaList";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function QcCoaCertificatesPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <QcCoaList dictionary={dictionary.quality_control_page_dic ?? "-"} />;
}
