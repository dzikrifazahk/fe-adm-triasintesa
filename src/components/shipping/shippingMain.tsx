import { getDictionary } from "../../../get-dictionary";

export default function ShippingMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["shipping_page_dic"];
}) {
  return (
    <>
      <div>Shipping</div>
    </>
  );
}
