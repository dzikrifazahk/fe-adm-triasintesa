import { redirect } from "next/navigation";
import { Locale } from "../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function CustomerPage({ params }: Props) {
  const { lang } = await params;
  redirect(`/${lang}/dashboard/settings/customer`);
}
