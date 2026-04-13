import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import TanksRefillMain from "@/components/tanks-refill/tankRefillMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function TankRefillPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <TanksRefillMain dictionary={dictionary.tanks_refill_page_dic ?? "-"} />
    </>
  );
}
