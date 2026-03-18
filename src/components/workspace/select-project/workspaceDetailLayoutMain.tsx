"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { redirect, useParams, usePathname } from "next/navigation";
import { useWorkspaceContext } from "@/context/workspaceContext";
import { Slash } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { getUser } from "@/services/base.service";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { getDictionary } from "../../../../get-dictionary";

interface INotificationSPB {
  total_spb: number;
  unapprove_spb_total: number;
  detail_unapprove_spb: any[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  know_kepalagudang_spb_unapproved: number;
  know_supervisor_spb_unapproved: number;
  request_owner_spb_unapproved: number;
}
export default function WorkspaceDetailLayoutMain({
  children,
  dictionary,
}: {
  children: React.ReactNode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["menu_bar_settings"];
}) {
  const { isCollapsed, projectName } = useWorkspaceContext();
  const { isMobile } = useContext(MobileContext);
  const params = useParams();
  const pathname = usePathname();
  const [activePage, setActivePage] = useState(""); // 1 = Purchase, 2 = Man Power
  const [pageSize, setPageSize] = useState(10);
  const [notificationData, setNotificationData] = useState<INotificationSPB>({
    total_spb: 0,
    unapprove_spb_total: 0,
    detail_unapprove_spb: [],
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1,
    },
    know_kepalagudang_spb_unapproved: 0,
    know_supervisor_spb_unapproved: 0,
    request_owner_spb_unapproved: 0,
  });
  const [cookies, setCookie] = useState<any>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getSPBNotification = async (page?: number, perPage?: number) => {
    try {
      setIsLoading(true);
      //   const response = await spbService.getNotificationSPB({
      //     page: page || 1,
      //     per_page: perPage || pageSize,
      //     project: String(params.workspace),
      //   });
      //   setNotificationData(response);
    } catch (error) {
      console.error("Error fetching SPB notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChangePagination = async (page: number) => {
    if (
      page >= 1 &&
      page <= notificationData.pagination.last_page &&
      page !== notificationData.pagination.current_page
    ) {
      await getSPBNotification(page, pageSize);
    }
  };

  const handlePageSizeChange = async (value: string) => {
    const newPageSize = parseInt(value, 10);
    setPageSize(newPageSize);
    await getSPBNotification(1, newPageSize);
  };

  const handlePageChange = (value: string) => {
    setIsLoading(true);
    if (value === "1") {
      setTimeout(() => {
        setIsLoading(false);
        redirect(`/dashboard/workspace/${params.workspace}/purchase`);
      }, 500);
    } else if (value === "2") {
      setTimeout(() => {
        setIsLoading(false);
        redirect(`/dashboard/workspace/${params.workspace}/man-power`);
      }, 500);
    }
    setActivePage(value);
  };

  useEffect(() => {
    if (pathname === `/dashboard/workspace/${params.workspace}/purchase`) {
      setActivePage("1");
    } else if (
      pathname === `/dashboard/workspace/${params.workspace}/man-power`
    ) {
      setActivePage("2");
    }
  }, [pathname]);

  useEffect(() => {
    const user = getUser();
    setCookie(user);
    getSPBNotification();
  }, []);

  const handleGetNotification = () => {
    setIsNotificationModalOpen(true);
  };

  return (
    <>
      <div className="w-full h-full pb-20 border border-black-500 bg-white rounded-lg dark:bg-card">
        <div className="m-2 flex flex-col sm:flex-row gap-4">
          {/* Breadcrumb */}
          <div className={`w-full ${isMobile ? "text-sm" : ""}`}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/dashboard/workspace"
                    className="text-xs"
                  >
                    Workspace
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/dashboard/workspace/${params.workspace}`}
                    className="text-xs"
                  >
                    {projectName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Main content area */}
        <div className="h-full ml-4 mr-4 overflow-x-scroll">
          <div
            className={`h-full w-full ${
              isMobile ? "overflow-auto" : "overflow-x-scroll"
            }`}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Modal Notification */}
      {/* <Dialog
        open={isNotificationModalOpen}
        onOpenChange={setIsNotificationModalOpen}
      >
        <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notifikasi</DialogTitle>
            <div
              className="flex w-full items-center p-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
              role="alert"
            >
              <svg
                className="shrink-0 inline w-4 h-4 me-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <div className="w-full">
                <div className="flex gap-3 items-center">
                  <span className="font-medium w-28">Total SPB</span>
                  <span>{notificationData?.total_spb ?? 0}</span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="font-medium w-28">Owner</span>
                  <span>
                    {notificationData?.request_owner_spb_unapproved ?? 0}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="font-medium w-28">Supervisor</span>
                  <span>
                    {notificationData?.know_supervisor_spb_unapproved ?? 0}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="font-medium w-28">Kepala Gudang</span>
                  <span>
                    {notificationData?.know_kepalagudang_spb_unapproved ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {notificationData.detail_unapprove_spb?.length > 0 ? (
              notificationData.detail_unapprove_spb.map(
                (notification: any, index: number) => {
                  const createdAt = notification.createdAt
                    ? new Date(notification.createdAt)
                    : null;

                  return (
                    <div
                      key={notification.docNo || index}
                      className="p-3 bg-gray-100 rounded-md shadow-md flex justify-between items-center"
                    >
                      <span className="text-sm">
                        Persetujuan Belum Lengkap:{" "}
                        {notification.docNo || "Tidak ada pesan"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {createdAt && !isNaN(createdAt.getTime())
                          ? format(createdAt, "dd MMM yyyy")
                          : "Tanggal tidak valid"}
                      </span>
                    </div>
                  );
                }
              )
            ) : (
              <p className="text-sm text-gray-500">Tidak ada notifikasi.</p>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex justify-between w-full">
              <div className="w-1/3">
                <span className="text-xs">
                  Halaman {notificationData.pagination.current_page} dari{" "}
                  {notificationData.pagination.last_page}
                </span>
              </div>
              <div className="w-full flex justify-end">
                <div className="flex items-center gap-2">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => handlePageSizeChange(value)}
                  >
                    <SelectTrigger className="px-3 py-1 bg-gray-100 text-sm rounded-md">
                      Tampilkan {pageSize}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() =>
                      handlePageChangePagination(
                        notificationData.pagination.current_page - 1
                      )
                    }
                    disabled={notificationData.pagination.current_page === 1}
                    className={`px-3 py-1 bg-primary text-white rounded-md ${
                      notificationData.pagination.current_page === 1
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      handlePageChangePagination(
                        notificationData.pagination.current_page + 1
                      )
                    }
                    disabled={
                      notificationData.pagination.current_page ===
                      notificationData.pagination.last_page
                    }
                    className={`px-3 py-1 bg-primary text-white rounded-md ${
                      notificationData.pagination.current_page ===
                      notificationData.pagination.last_page
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}
    </>
  );
}
