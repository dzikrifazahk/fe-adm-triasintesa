import VerifiedPageMain from "@/components/workspace/purchase-page/verified/default";
import { getDictionary } from "../../../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../../../i18n-config";

export default async function VerifiedPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <VerifiedPageMain dictionary={dictionary?.workspace ?? "-"} />
    </>
  );
}
