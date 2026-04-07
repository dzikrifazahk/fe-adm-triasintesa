import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import { InventoryLayoutMain } from "@/components/inventory/inventoryLayoutMain";

export default async function InventoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <InventoryLayoutMain dictionary={dictionary?.inventory_page_dic ?? "-"}>
        {children}
      </InventoryLayoutMain>
    </>
  );
}
