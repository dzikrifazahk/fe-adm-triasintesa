import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import { TanksRefillLayoutMain } from "@/components/tanks-refill/tanksRefillLayoutMain";

export default async function ShippingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <TanksRefillLayoutMain dictionary={dictionary?.tanks_refill_page_dic ?? "-"}>
        {children}
      </TanksRefillLayoutMain>
    </>
  );
}


