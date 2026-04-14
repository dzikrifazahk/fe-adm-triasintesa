import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import { FinancialRecordLayoutMain } from "@/components/financial-record/financialRecordLayoutMain";

export default async function FinancialRecordLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <FinancialRecordLayoutMain dictionary={dictionary.financial_record_page_dic}>
      {children}
    </FinancialRecordLayoutMain>
  );
}
