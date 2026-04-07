import { getDictionary } from "../../../get-dictionary";

export default function InventoryMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["inventory_page_dic"];
}) {
  return (
    <>
      <div>Inventory</div>
    </>
  );
}
