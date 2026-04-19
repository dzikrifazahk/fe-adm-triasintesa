import { getDictionary } from "../../../get-dictionary";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["customer_page_dic"];
  children: React.ReactNode;
}

export function CustomerLayoutMain({ dictionary, children }: Props) {
  return (
    <div className="bg-card flex h-full w-full shadow min-h-0 min-w-0 rounded-lg border p-6">
      {children}
    </div>
  );
}
