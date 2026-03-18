"use client";

import { getDictionary } from "../../../../get-dictionary";
import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa6";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModalAddPurchase from "@/components/purchase/modalAddPurchase";
import { useLoading } from "@/context/loadingContext";

import {
  PurchaseRefreshProvider,
  usePurchaseRefreshEmitter,
  PurchaseTabChannel,
} from "@/context/purchaseLoadingContext";

export default function PurchaseLayoutMain({
  children,
  dictionary,
}: {
  children: React.ReactNode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["workspace"];
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { setIsLoading } = useLoading();

  const [loading, setLoading] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<PurchaseTabChannel | undefined>();

  const handleChangeMenu = (url: PurchaseTabChannel) => {
    // setLoading(true);
    setIsLoading(true);
    setActiveTab(url);
    redirect(`/dashboard/workspace/${params.workspace}/purchase/${url}`);
  };

  useEffect(() => {
    const last = pathname.split("/").pop() as PurchaseTabChannel | undefined;
    if (
      last === "submission" ||
      last === "verified" ||
      last === "payment-request" ||
      last === "paid"
    ) {
      setActiveTab(last);
    }
  }, [pathname]);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  return (
    <PurchaseRefreshProvider>
      <LayoutBody
        activeTab={activeTab}
        setIsOpenAddModal={setIsOpenAddModal}
        isOpenAddModal={isOpenAddModal}
        handleChangeMenu={handleChangeMenu}
        onAfterCreate={() => {
          // Opsional: segarkan server segment juga
          router.refresh();
        }}
      >
        {children}
      </LayoutBody>
    </PurchaseRefreshProvider>
  );
}

function LayoutBody({
  children,
  isOpenAddModal,
  setIsOpenAddModal,
  activeTab,
  handleChangeMenu,
  onAfterCreate,
}: {
  children: React.ReactNode;
  isOpenAddModal: boolean;
  setIsOpenAddModal: (v: boolean) => void;
  activeTab: PurchaseTabChannel;
  handleChangeMenu: (url: PurchaseTabChannel) => void;
  onAfterCreate: () => void;
}) {
  const emit = usePurchaseRefreshEmitter();

  const handleCloseModal = () => {
    setIsOpenAddModal(false);
    emit(activeTab);
    onAfterCreate();
  };

  return (
    <>
      <div className="flex flex-col gap-5 w-full h-full">
        <div className="w-full flex gap-3">
          <Button
            className="bg-iprimary-blue hover:bg-iprimary-blue-secondary cursor-pointer"
            onClick={() => setIsOpenAddModal(true)}
          >
            <FaPlus />
            Tambah Purchase
          </Button>
        </div>

        <div>
          <Tabs defaultValue={activeTab} className="w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                className={`lg:text-sm text-xs cursor-pointer ${
                  activeTab === "submission"
                    ? "bg-white cursor-not-allowed"
                    : ""
                }`}
                value="submission"
                onClick={
                  activeTab !== "submission"
                    ? () => handleChangeMenu("submission")
                    : undefined
                }
              >
                Pengajuan
              </TabsTrigger>
              {/* <TabsTrigger
                className={`lg:text-sm text-xs cursor-pointer ${
                  activeTab === "verified" ? "bg-white cursor-not-allowed" : ""
                }`}
                value="verified"
                onClick={
                  activeTab !== "verified"
                    ? () => handleChangeMenu("verified")
                    : undefined
                }
              >
                Terverifikasi
              </TabsTrigger> */}
              <TabsTrigger
                className={`lg:text-sm text-xs cursor-pointer ${
                  activeTab === "payment-request"
                    ? "bg-white cursor-not-allowed"
                    : ""
                }`}
                value="payment-request"
                onClick={
                  activeTab !== "payment-request"
                    ? () => handleChangeMenu("payment-request")
                    : undefined
                }
              >
                Permintaan Pembayaran
              </TabsTrigger>
              <TabsTrigger
                className={`lg:text-sm text-xs cursor-pointer ${
                  activeTab === "paid" ? "bg-white cursor-not-allowed" : ""
                }`}
                value="paid"
                onClick={
                  activeTab !== "paid"
                    ? () => handleChangeMenu("paid")
                    : undefined
                }
              >
                Telah Dibayar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="w-full h-full">{children}</div>
      </div>

      <ModalAddPurchase
        isOpen={isOpenAddModal}
        title="Add Purchase"
        modalType="create"
        onClose={() => setIsOpenAddModal(false)}
        isGetData={handleCloseModal}
        setIsLoading={() => {}}
      />
    </>
  );
}
