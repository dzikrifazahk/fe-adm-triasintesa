import { ClipboardList, MousePointerClick } from "lucide-react";
import { getDictionary } from "../../../get-dictionary";

export default function ProductionMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["production_page_dic"];
}) {
  const productionPlanDictionary = dictionary.production_plan;

  return (
    <div className="grid min-h-full place-items-center rounded-lg border bg-white dark:border-[#34363B] dark:bg-[#26282D] p-8">
      <div className="flex max-w-xl flex-col items-center gap-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4338CA] dark:bg-[#313754] dark:text-[#8EA2FF]">
          <ClipboardList className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">
            {productionPlanDictionary.empty_title}
          </h2>
          <p className="text-sm leading-6 text-[#6B7280] dark:text-slate-300">
            {productionPlanDictionary.empty_description}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-dashed border-[#C7D2FE] bg-[#F8FAFF] px-4 py-2 text-sm text-[#4B5563] dark:border-[#4B5BA8] dark:bg-[#2B3044] dark:text-slate-200">
          <MousePointerClick className="h-4 w-4 text-[#4338CA] dark:text-[#8EA2FF]" />
          <span>{productionPlanDictionary.empty_hint}</span>
        </div>
      </div>
    </div>
  );
}
