import { Locale } from "../../../../../../../i18n-config";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function QCPage({ params }: Props) {
  const { lang } = await params;
  redirect(`/${lang}/dashboard/qc/inspections`);
}
