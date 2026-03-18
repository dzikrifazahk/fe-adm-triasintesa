import NotificationsMainDashboard from "@/components/dashboard/notifications/notificationsMainDashboard";
import { getDictionary } from "../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../i18n-config";

export default async function Notifications(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return <NotificationsMainDashboard />;
}
