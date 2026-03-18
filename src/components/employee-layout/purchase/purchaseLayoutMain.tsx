"use client";
import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoading } from "@/context/loadingContext";
import { getDictionary } from "../../../../get-dictionary";
import { Button } from "@/components/ui/button";
import { ModalPurchase } from "@/components/custom/modalAddPurchase";
import { useEffect, useState } from "react";

export default function PurchaseLayoutMain({
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
  const [isOpenModalPurchase, setIsOpenModalPurchase] = useState(false);
  const tabs = [
    { value: "submit", label: "Submit" },
    { value: "verified", label: "Verified" },
    { value: "payment-request", label: "Payment Request" },
    { value: "paid", label: "Paid" },
  ];

  const currentTab = tabs.find((tab) => pathname?.includes(tab.value))?.value;

  const handleTabChange = (value: string) => {
    if (value === currentTab) return;

    setIsLoading(true);
    router.push(`/${lang}/purchase/${value}`);
  };

  const handle = () => {};

  useEffect(() => {
    setIsLoading(false);
  }, []);
  return (
    <>
      <div className="w-full p-5">
        <div className="mb-6 bg-iprimary-blue-secondary p-3 rounded-lg w-full">
          <h1 className="text-3xl font-sans-bold mb-1 text-white">Pembelian</h1>
          <p className="text-gray-200 font-sans">
            Pembelian Barang untuk project
          </p>
        </div>
        <Button
          className="cursor-pointer mb-5 bg-iprimary-blue hover:bg-iprimary-blue-tertiary"
          onClick={() => setIsOpenModalPurchase(true)}
        >
          Add Purchase
        </Button>
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
          <div>{children}</div>
        </Tabs>
      </div>
      <ModalPurchase
        isGetData={handle}
        modalType="create"
        setIsLoading={setIsLoading}
        isOpen={isOpenModalPurchase}
        onClose={() => setIsOpenModalPurchase(false)}
        title="Add Purchase"
        detailData={null}
      />
    </>
  );
}
