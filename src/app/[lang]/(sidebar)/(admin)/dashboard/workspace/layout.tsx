import { WorkspaceLayoutMain } from "@/components/workspace/layoutDefaultMain";
import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";

export default async function WorkspaceLayout({
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
      <WorkspaceLayoutMain dictionary={dictionary?.menu_bar_settings ?? "-"}>
        {children}
      </WorkspaceLayoutMain>
    </>
  );
}
