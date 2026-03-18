import OvertimeMain from "@/components/man-power/overtime/overtimeMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Overtime({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <OvertimeMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
