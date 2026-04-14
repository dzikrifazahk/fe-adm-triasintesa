import { Locale } from "../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../get-dictionary";
import QcRejectLogsMain from "@/components/qc/reject-logs/QcRejectLogsMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function QcRejectLogsPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <QcRejectLogsMain
      dictionary={dictionary.quality_control_page_dic ?? "-"}
    />
  );
}
