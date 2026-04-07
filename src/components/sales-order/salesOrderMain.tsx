import { getDictionary } from "../../../get-dictionary";

export default function SalesOrderMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["sales_order_page_dic"];
}) {
  return (
    <>
      <div>Sales Order</div>
    </>
  );
}
