import { getDictionary } from "../../../../../../get-dictionary";
import { Locale } from "../../../../../../i18n-config";
import ProfileEmpMain from "@/components/employee-layout/profile/profileMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Profile({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <ProfileEmpMain />
    </>
  );
}
