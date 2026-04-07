import { getDictionary } from "../../../get-dictionary";

export default function ReportMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["report_page_dic"];
}) {
  return (
    <>
      <div>Report</div>
    </>
  );
}
