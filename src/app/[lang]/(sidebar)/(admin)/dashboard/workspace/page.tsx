import WorkspaceDefault from "@/components/workspace/default";
import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";

export default async function Workspace(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <WorkspaceDefault dictionary={dictionary?.workspace ?? "-"} />
    </>
  );
}
