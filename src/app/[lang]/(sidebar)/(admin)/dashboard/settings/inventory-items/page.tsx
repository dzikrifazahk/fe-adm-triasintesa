import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";
import SettingsInventoryItemsMain from "@/components/settings/inventory-items/settingsInventoryItemsMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function InventoryItemsPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <SettingsInventoryItemsMain dictionary={dictionary.inventory_item_page_dic} />;
}
