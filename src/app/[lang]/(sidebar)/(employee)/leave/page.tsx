import LeaveEmpMain from "@/components/employee-layout/leave/leaveMain";
import { getDictionary } from "../../../../../../get-dictionary";
import { Locale } from "../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Leave({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <LeaveEmpMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
