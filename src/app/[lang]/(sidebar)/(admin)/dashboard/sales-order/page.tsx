import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import SalesOrderMain from "@/components/sales-order/salesOrderMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function SalesOrderPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <SalesOrderMain dictionary={dictionary.sales_order_page_dic ?? "-"} />
    </>
  );
}
