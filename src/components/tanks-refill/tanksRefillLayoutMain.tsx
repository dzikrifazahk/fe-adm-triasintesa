import { getDictionary } from "../../../get-dictionary";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["tanks_refill_page_dic"];
  children: React.ReactNode;
}

export function TanksRefillLayoutMain({ dictionary, children }: Props) {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 md:rounded-lg md:border md:bg-card md:p-6 md:shadow">
      {children}
    </div>
  );
}
