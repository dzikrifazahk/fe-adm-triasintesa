import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import ReportMain from "@/components/report/reportMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function ReportPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <ReportMain dictionary={dictionary.report_page_dic} />;
}
