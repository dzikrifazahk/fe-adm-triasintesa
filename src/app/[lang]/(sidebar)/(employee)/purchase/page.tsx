import PurchaseMain from "@/components/employee-layout/purchase/defaultPage";
import { Locale } from "../../../../../../i18n-config";
import { getDictionary } from "../../../../../../get-dictionary";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function PurchasePage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <PurchaseMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
