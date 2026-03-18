import CashAdvancehMain from "@/components/man-power/cash-advance/cashAdvanceMain";
import { Locale } from "../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../get-dictionary";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function PettyCash({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <CashAdvancehMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
