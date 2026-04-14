import { getDictionary } from "../../../get-dictionary";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["report_page_dic"];
  children: React.ReactNode;
}

export function ReportLayoutMain({ dictionary, children }: Props) {
  return (
    <div
      data-page={dictionary?.title ?? "Report"}
      className="flex h-full min-h-0 w-full min-w-0 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.95)_0%,_rgba(255,255,255,1)_18%)] p-4 shadow-sm lg:p-6"
    >
      {children}
    </div>
  );
}
