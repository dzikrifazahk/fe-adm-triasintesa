import PaidPageMain from "@/components/workspace/purchase-page/paid/default";
import { getDictionary } from "../../../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../../../i18n-config";

export default async function PaymentRequestPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <PaidPageMain dictionary={dictionary?.workspace ?? "-"} />
    </>
  );
}
