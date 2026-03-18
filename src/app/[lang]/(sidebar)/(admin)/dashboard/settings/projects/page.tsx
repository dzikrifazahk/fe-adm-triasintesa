import SettingsProjectsMain from "@/components/settings/projects/settingsProjectsMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function ProjectsPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <SettingsProjectsMain dictionary={dictionary?.settings_projects ?? "-"} />
    </>
  );
}
