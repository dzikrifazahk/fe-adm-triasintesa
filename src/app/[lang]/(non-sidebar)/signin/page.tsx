import SignIn from "@/components/signIn/signIn";
import { Locale } from "../../../../../i18n-config";
import { getDictionary } from "../../../../../get-dictionary";

export default async function SignInPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  return <SignIn dictionary={dictionary?.signin ?? "-"} />;
}
