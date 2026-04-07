import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import { SalesOrderLayoutMain } from "@/components/sales-order/salesOrderLayoutMain";

export default async function SalesOrderLayout({
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
      <SalesOrderLayoutMain dictionary={dictionary?.sales_order_page_dic ?? "-"}>
        {children}
      </SalesOrderLayoutMain>
    </>
  );
}
