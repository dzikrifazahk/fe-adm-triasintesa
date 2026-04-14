import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import { ShippingLayoutMain } from "@/components/shipping/shippingLayoutMain";

export default async function ShippingLayout({
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
      <ShippingLayoutMain dictionary={dictionary?.shipping_page_dic ?? "-"}>
        {children}
      </ShippingLayoutMain>
    </>
  );
}
