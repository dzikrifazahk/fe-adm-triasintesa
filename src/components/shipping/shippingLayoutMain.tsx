import { getDictionary } from "../../../get-dictionary";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["shipping_page_dic"];
  children: React.ReactNode;
}

export function ShippingLayoutMain({ dictionary, children }: Props) {
  return (
    <div className="flex h-full w-full min-h-0 min-w-0 md:rounded-lg md:border md:bg-card md:p-6 md:shadow">
      {children}
    </div>
  );
}
