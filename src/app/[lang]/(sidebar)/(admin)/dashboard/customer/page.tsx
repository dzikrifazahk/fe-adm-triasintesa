import { redirect } from "next/navigation";
import { Locale } from "../../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function CustomerPage({ params }: Props) {
  const { lang } = await params;
  redirect(`/${lang}/dashboard/settings/customer`);
}
