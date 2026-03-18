import PayrollMain from "@/components/man-power/payroll/payrollMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Payroll({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <PayrollMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
