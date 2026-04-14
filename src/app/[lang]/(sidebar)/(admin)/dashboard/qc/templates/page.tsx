import { Locale } from "../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../get-dictionary";
import QcTemplatesMain from "@/components/qc/templates/QcTemplatesMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function QcTemplatesPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <QcTemplatesMain dictionary={dictionary.quality_control_page_dic ?? "-"} />
  );
}
