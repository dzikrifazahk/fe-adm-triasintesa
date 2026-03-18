"use client";

import Image from "next/image";
import IlDefault from "@/assets/ic/empty-state-settings-ic.svg";
import { useEffect, useState } from "react";
import { useLoading } from "@/context/loadingContext";
import { getDictionary } from "../../../get-dictionary";
import { purchaseService } from "@/services";
import { IPurchase } from "@/types/purchase";
import { DataTable } from "./purchase-page/submission/data-table";
import PurchaseStatusBadge from "../purchase/purchaseStatusBadge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { IMeta } from "@/types/common";
import { FaEye } from "react-icons/fa6";
import { ColumnDef } from "@tanstack/react-table";
import useDebounce from "@/utils/useDebouncy";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["workspace"];
}

export default function WorkspaceDefault({ dictionary }: Props) {
  const router = useRouter();
  const { setIsLoading } = useLoading();
  const [isLoading, setIsLoadingFetch] = useState(false);
  const [data, setData] = useState<IPurchase[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 700);
  const [filterPayload, setFilterPayload] = useState("");

  const fetchProject = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ) => {
    try {
      setIsLoadingFetch(true);
      const { data, meta } = await purchaseService.getPurchases({
        tab: 1,
        page,
        per_page: pageSize,
        search,
        ...payload,
      });
      setData(data);
      setMetadata(meta);
    } catch (error) {
      setIsLoadingFetch(false);
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingFetch(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchProject(newPage, pageSize, debouncedSearch, filterPayload);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    fetchProject(page, newPageSize, debouncedSearch, filterPayload);
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  useEffect(() => {
    fetchProject(page, pageSize, debouncedSearch, filterPayload);
    setIsLoading(false);
  }, [debouncedSearch]);

  return (
    <div className="w-full h-full border border-black-500 bg-white rounded-lg dark:bg-card p-4">
      <h2 className={`text-lg font-bold mb-5`}>
        {dictionary.purchase.title_tab_1}
      </h2>
      <DataTable
        columns={columns()}
        data={data}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        metadata={metadata}
        onSearchChange={handleSearchChange}
        isClearPayload={function (payload: boolean): void {
          throw new Error("Function not implemented.");
        }}
        selectedData={(e) =>
          router.push(`/dashboard/workspace/${e.project.id}/purchase`)
        }
        searchValue={search}
        isLoading={isLoading}
      />
    </div>
  );
}

const columns = (): ColumnDef<IPurchase>[] => {
  return [
    {
      id: "No. Dokumen",
      header: "No. Dokumen",
      cell: ({ row }) => {
        const docNo = row.original?.doc_no ?? "-";
        const status = row.original?.status_purchase?.name ?? "-";

        return (
          <div className="flex flex-col gap-1">
            <span className="text-xs">{docNo}</span>
            <PurchaseStatusBadge status={status} locale="en" />
          </div>
        );
      },
    },
    {
      id: "Jenis Purchase",
      header: "Jenis Purchase",
      cell: ({ row }) => row.original?.purchase_type?.name ?? "-",
    },
    {
      id: "Projek",
      header: "Projek",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/workspace/${row.original?.project?.id ?? "#"}/purchase`}
          className="text-iprimary-blue underline"
        >
          {row.original?.project?.name ?? "-"}
        </Link>
      ),
    },
    {
      id: "Deskripsi",
      header: "Deskripsi",
      cell: ({ row }) => {
        const desc = row.original?.description;
        return <span className="text-xs">{desc ?? "-"}</span>;
      },
    },
    {
      id: "Tanggal",
      header: "Tanggal",
      cell: ({ row }) => {
        const docType = row.original.doc_type;
        const dateStart = format(
          row.original?.date_start_create_purchase ?? "",
          "dd MMM yyyy",
          {
            locale: id,
          }
        );
        const dateEnd = format(
          row.original?.due_date_end_purchase ?? "",
          "dd MMM yyyy",
          {
            locale: id,
          }
        );

        return (
          <>
            <span>
              {docType === "FLASH CASH"
                ? dateStart
                : `${dateStart} - ${dateEnd}`}
            </span>
            <br />
          </>
        );
      },
    },
    {
      id: "Total",
      header: "Total",
      cell: ({ row }) => {
        let total = formatCurrencyIDR(Number(row.original?.total) ?? 0);

        return (
          <>
            <span>{total}</span>
            <br />
          </>
        );
      },
    },
  ];
};
