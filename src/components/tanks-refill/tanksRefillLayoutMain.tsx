import { getDictionary } from "../../../get-dictionary";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["tanks_refill_page_dic"];
  children: React.ReactNode;
}

export function TanksRefillLayoutMain({ dictionary, children }: Props) {
  return (
    <div className="bg-card flex h-full min-h-0 w-full min-w-0 shadow rounded-lg border p-6">
      {children}
    </div>
  );
}
