import { Locale } from "../../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../../get-dictionary";
import WorkspaceManPowerMain from "@/components/workspace/man-power/workspaceManPowerMain";

export default async function WorkspaceDetail(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <WorkspaceManPowerMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
