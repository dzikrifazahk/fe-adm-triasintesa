import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import { CustomerLayoutMain } from "@/components/customer/customerLayoutMain";

export default async function CustomerLayout({
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
      <CustomerLayoutMain dictionary={dictionary?.customer_page_dic ?? "-"}>
        {children}
      </CustomerLayoutMain>
    </>
  );
}
