import { getDictionary } from "../../../get-dictionary";

interface Props {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["financial_record_page_dic"];
  children: React.ReactNode;
}

export function FinancialRecordLayoutMain({ dictionary, children }: Props) {
  return (
    <div
      data-page={dictionary?.title ?? "Financial Record"}
      className="flex h-full min-h-0 w-full min-w-0 rounded-[28px]  bg-card p-4 shadow-sm lg:p-6"
    >
      {children}
    </div>
  );
}
