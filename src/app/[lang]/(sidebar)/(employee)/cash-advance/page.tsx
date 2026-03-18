import CashAdvanceMain from "@/components/employee-layout/cash-advance/cashAdvanceMain";
import { getDictionary } from "../../../../../../get-dictionary";
import { Locale } from "../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function CashAdvance({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <CashAdvanceMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
