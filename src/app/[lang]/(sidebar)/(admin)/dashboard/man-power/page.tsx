import ManPowerMain from "@/components/man-power/manPowerMain";
import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function ManPower({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <ManPowerMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
