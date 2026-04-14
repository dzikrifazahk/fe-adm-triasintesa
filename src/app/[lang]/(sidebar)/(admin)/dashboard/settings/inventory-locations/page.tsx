import { getDictionary } from "../../../../../../../../get-dictionary";
import { Locale } from "../../../../../../../../i18n-config";
import InventoryLocationsMain from "@/components/settings/inventory-locations/settingsTanksMain";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function InventoryLocationsPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <InventoryLocationsMain dictionary={dictionary.inventory_location_page_dic} />;
}
