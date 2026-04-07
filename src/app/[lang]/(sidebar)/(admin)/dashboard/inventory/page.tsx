import { Locale } from "../../../../../../../i18n-config";
import { getDictionary } from "../../../../../../../get-dictionary";
import InventoryMain from "@/components/inventory/inventoryMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function InventoryPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <>
      <InventoryMain dictionary={dictionary.inventory_page_dic ?? "-"} />
    </>
  );
}
