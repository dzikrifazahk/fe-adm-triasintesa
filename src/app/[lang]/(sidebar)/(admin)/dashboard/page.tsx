import { Locale } from "../../../../../../i18n-config";
import { getDictionary } from "../../../../../../get-dictionary";
import DashboardMainPage from "@/components/dashboard/dashboardMainPage";

export default async function DashboardHome(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <div className="h-full min-h-0 w-full flex flex-col relative md:rounded-lg md:border md:bg-white md:shadow md:dark:bg-[#292A2D]">
        <DashboardMainPage dictionary={dictionary.dashboard} />
      </div>
    </>
  );
}
