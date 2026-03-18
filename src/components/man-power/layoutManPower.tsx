"use client";

import { getDictionary } from "../../../get-dictionary";
import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useLoading } from "@/context/loadingContext";

export default function ManPowerLayout({
  dictionary,
  lang,
  children,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  lang: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { setIsLoading } = useLoading();

  const tabs = [
    { value: "attendance", label: "Absensi" },
    { value: "overtime", label: "Lembur" },
    { value: "cash-advance", label: "Pinjaman" },
    { value: "payroll", label: "Penggajian" },
    { value: "leave", label: "Cuti" },
  ];

  const currentTab = tabs.find((t) => pathname?.includes(t.value))?.value;

  const handleTabChange = (value: string) => {
    if (value === currentTab) return;
    setIsLoading(true);
    router.push(`/${lang}/dashboard/man-power/${value}`);
  };

  return (
    <div className="w-full h-full bg-white border rounded-xl overflow-auto pr-3 pl-3 dark:bg-card">
      <div className="sticky top-0 z-20 -mx-2 ">
        <div className="h-2 bg-white dark:bg-[#0b0c0d]" />
        <div className="px-2 pb-3 bg-white dark:bg-[#0b0c0d] border-b shadow-[0_8px_12px_-8px_rgba(0,0,0,0.15)]">
          <div className="bg-iprimary-blue-secondary p-3 rounded-lg w-full mb-3 dark:bg-muted">
            <h1 className="text-3xl font-sans-bold mb-1 text-white">
              {dictionary.title}
            </h1>
            <p className="text-gray-200 font-sans">{dictionary.description}</p>
          </div>

          <Tabs
            className="w-full"
            value={currentTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="flex flex-wrap justify-center gap-2">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="cursor-pointer"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="pt-3">{children}</div>
    </div>
  );
}
