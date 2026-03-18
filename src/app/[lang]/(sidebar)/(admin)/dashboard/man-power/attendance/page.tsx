import { Locale } from "../../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../../get-dictionary";
import AttendanceMain from "@/components/man-power/attendance/attendanceMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Attendance({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <AttendanceMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
