import { DataTableDemo } from "@/components/settings/test/settingsTestMain";
import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function Test({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <DataTableDemo />
    </>
  );
}
