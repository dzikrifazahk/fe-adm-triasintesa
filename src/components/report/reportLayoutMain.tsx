import { getDictionary } from "../../../get-dictionary";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["report_page_dic"];
  children: React.ReactNode;
}

export function ReportLayoutMain({ dictionary, children }: Props) {
  return (
    <div
      data-page={dictionary?.title ?? "Report"}
      className="flex h-full min-h-0 w-full min-w-0 md:rounded-[28px] md:border md:border-blue-100 md:bg-[linear-gradient(180deg,_rgba(239,246,255,0.9)_0%,_rgba(255,255,255,1)_22%)] md:p-4 md:shadow-sm lg:p-6 dark:md:bg-none dark:md:bg-card dark:md:border-white/10"
    >
      {children}
    </div>
  );
}
