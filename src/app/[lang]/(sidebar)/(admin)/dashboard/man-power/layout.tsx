import { getDictionary } from "../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../i18n-config";
import ManPowerLayout from "@/components/man-power/layoutManPower";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <ManPowerLayout
      children={children}
      lang={lang}
      dictionary={dictionary.man_power}
    />
  );
}
