import PurchaseSubmitMain from "@/components/employee-layout/purchase/submit/purchaseSubmitMain";
import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function VerifiedEmpPurchase({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <PurchaseSubmitMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
