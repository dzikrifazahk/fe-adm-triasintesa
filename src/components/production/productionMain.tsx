import { getDictionary } from "../../../get-dictionary";

export default function ProductionMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["production_page_dic"];
}) {
  return (
    <>
      <div>Production</div>
    </>
  );
}
