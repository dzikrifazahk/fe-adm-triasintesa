import { Locale } from "../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../get-dictionary";
import LeaveMain from "@/components/man-power/leave/leaveMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function LeavePage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <LeaveMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
