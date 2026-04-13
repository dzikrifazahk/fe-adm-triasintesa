import { getDictionary } from "../../../get-dictionary";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["tanks_refill_page_dic"];
  children: React.ReactNode;
}

export function TanksRefillLayoutMain({ dictionary, children }: Props) {
  return (
    <div className="bg-card flex h-full w-full shadow min-h-0 min-w-0 rounded-lg border p-6">
      {children}
    </div>
  );
}
