import AttendanceMain from "@/components/employee-layout/attendance/attendanceMain";
import { getDictionary } from "../../../../../../get-dictionary";
import { Locale } from "../../../../../../i18n-config";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function EmployeeAttendance({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <AttendanceMain dictionary={dictionary?.man_power ?? "-"} />
    </>
  );
}
