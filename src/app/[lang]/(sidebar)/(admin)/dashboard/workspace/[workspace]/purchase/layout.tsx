import PurchaseLayoutMain from "@/components/workspace/purchase-page/purchaseLayoutMain";
import { getDictionary } from "../../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../../i18n-config";

export default async function PurchaseLayout({
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
      <PurchaseLayoutMain dictionary={dictionary?.workspace ?? "-"}>
        {children}
      </PurchaseLayoutMain>
    </>
  );
}
