import { Locale } from "../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../get-dictionary";
import WorkspaceDetailLayoutMain from "@/components/workspace/select-project/workspaceDetailLayoutMain";

export default async function WorkspaceDetailLayour({
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
      <WorkspaceDetailLayoutMain dictionary={dictionary?.menu_bar_settings ?? "-"}>
        {children}
      </WorkspaceDetailLayoutMain>
    </>
  );
}
