import PurchaseLayoutMain from "@/components/employee-layout/purchase/purchaseLayoutMain";
import { getDictionary } from "../../../../../../get-dictionary";
import { Locale } from "../../../../../../i18n-config";

export default async function PurchaseEmp({
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
      <PurchaseLayoutMain
        dictionary={dictionary?.man_power ?? "-"}
        lang={lang}
        children={children}
      />
    </>
  );
}
