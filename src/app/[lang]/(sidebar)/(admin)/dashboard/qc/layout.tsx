import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import { QCLayoutMain } from "@/components/qc/qcLayoutMain";

export default async function QcLayout({
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
      <QCLayoutMain dictionary={dictionary?.quality_control_page_dic ?? "-"}>
        {children}
      </QCLayoutMain>
    </>
  );
}
