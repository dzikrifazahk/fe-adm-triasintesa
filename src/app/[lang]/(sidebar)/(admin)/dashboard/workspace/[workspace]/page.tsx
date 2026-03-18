import { Locale } from "../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../get-dictionary";
import WorkspaceDetailMain from "@/components/workspace/select-project/workspaceDetailMain";

export default async function WorkspaceDetail(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <WorkspaceDetailMain dictionary={dictionary?.workspace ?? "-"} />
    </>
  );
}
