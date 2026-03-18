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
      <div className="h-screen border shadow w-full bg-white dark:bg-[#292A2D] flex flex-col relative rounded-lg">
        <DashboardMainPage dictionary={dictionary.dashboard} />
      </div>
    </>
  );
}
