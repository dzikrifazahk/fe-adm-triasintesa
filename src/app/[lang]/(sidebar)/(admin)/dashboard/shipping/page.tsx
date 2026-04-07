import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import SalesOrderMain from "@/components/sales-order/salesOrderMain";
import ShippingMain from "@/components/shipping/shippingMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function ShippingPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <ShippingMain dictionary={dictionary.shipping_page_dic ?? "-"} />
    </>
  );
}
