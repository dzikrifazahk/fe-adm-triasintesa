import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import CustomerMain from "@/components/customer/customerMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function CustomerPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <CustomerMain dictionary={dictionary.customer_page_dic ?? "-"} />
    </>
  );
}
