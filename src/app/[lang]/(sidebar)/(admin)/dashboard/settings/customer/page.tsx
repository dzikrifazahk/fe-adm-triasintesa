import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";
import CustomerMain from "@/components/customer/customerMain";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function SettingsCustomerPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return <CustomerMain dictionary={dictionary.customer_page_dic ?? "-"} />;
}
