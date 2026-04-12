import { ClipboardList, MousePointerClick } from "lucide-react";
import { getDictionary } from "../../../get-dictionary";

export default function ProductionMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["production_page_dic"];
}) {
  return (
    <div className="grid min-h-full place-items-center rounded-lg border bg-white p-8">
      <div className="flex max-w-xl flex-col items-center gap-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4338CA]">
          <ClipboardList className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1F2937]">
            {dictionary.production_input.default_page_title}
          </h2>
          <p className="text-sm leading-6 text-[#6B7280]">
            Pilih salah satu production plan pada panel sebelah kiri terlebih
            dahulu untuk melihat detail data, jadwal, dan target produksi.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-dashed border-[#C7D2FE] bg-[#F8FAFF] px-4 py-2 text-sm text-[#4B5563]">
          <MousePointerClick className="h-4 w-4 text-[#4338CA]" />
          <span>Klik salah satu item production plan untuk mulai melihat detail.</span>
        </div>
      </div>
    </div>
  );
}
