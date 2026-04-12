import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Locale } from "../../../i18n-config";

export default async function LocaleRootPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (accessToken) {
    redirect(`/${lang}/dashboard`);
  }

  redirect(`/${lang}/signin`);
}
