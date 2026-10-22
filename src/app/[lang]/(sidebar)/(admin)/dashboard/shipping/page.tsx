import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import ShippingMain from "@/components/shipping/shippingMain";

type Props = {
  params: Promise<{ lang: string }>;
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
