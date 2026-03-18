import HomeEmpMain from "@/components/employee-layout/home/homeEmpMain";
import { getDictionary } from "../../../../../get-dictionary";
import { Locale } from "../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Home({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <HomeEmpMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
