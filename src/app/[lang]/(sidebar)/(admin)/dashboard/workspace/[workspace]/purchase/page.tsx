import WorkspacePurchaseDefault from "@/components/workspace/purchase-page/default";
import { Locale } from "../../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../../get-dictionary";

export default async function WorkspacePurchaseDefaultPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <WorkspacePurchaseDefault dictionary={dictionary?.workspace ?? "-"} />
    </>
  );
}
