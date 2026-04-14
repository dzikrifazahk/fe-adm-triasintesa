import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import FinancialRecordMain from "@/components/financial-record/financialRecordMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function FinancialRecordPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <FinancialRecordMain dictionary={dictionary.financial_record_page_dic} />;
}
