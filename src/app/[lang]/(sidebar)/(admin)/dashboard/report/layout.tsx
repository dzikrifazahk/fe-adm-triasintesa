import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import { ReportLayoutMain } from "@/components/report/reportLayoutMain";

export default async function ReportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <ReportLayoutMain dictionary={dictionary?.report_page_dic ?? "-"}>
        {children}
      </ReportLayoutMain>
    </>
  );
}
