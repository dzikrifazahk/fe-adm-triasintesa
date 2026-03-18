import SubmissionPageMain from "@/components/workspace/purchase-page/submission/default";
import { getDictionary } from "../../../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../../../i18n-config";

export default async function SubmissionPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <SubmissionPageMain dictionary={dictionary?.workspace ?? "-"} />
    </>
  );
}
