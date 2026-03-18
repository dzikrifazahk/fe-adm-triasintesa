"use client";

import { IProject } from "@/types/project";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { formatNumberIDR } from "@/utils/currencyFormatter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  FaAlignJustify,
  FaCircleXmark,
  FaEye,
  FaFileCircleCheck,
  FaFileInvoice,
  FaHandshakeSimple,
  FaHandshakeSimpleSlash,
  FaLocationDot,
  FaMoneyBillTransfer,
  FaTrash,
} from "react-icons/fa6";
import { getStatusClass } from "@/helpers/statusCostProgressHelper";

type childProps = {
  deleteData: (id: string) => void;
  editData: (id: string, tableModal: string) => void;
  viewDetailData: (id: string) => void;
  acceptProject: (id: string) => void;
  rejectProject: (id: string) => void;
  cancelProject: (id: string) => void;
  closeProject: (id: string) => void;
  bonusProject?: (id: string) => void;
  payment: (id: string) => void;
  locationProject: (id: string) => void;
  cookies: any;
  // penting: callback untuk pindah mode + set project terpilih
  tableMode: (name: "project" | "task" | "budget", projectId?: string) => void;
};

export const columns = (props: childProps): ColumnDef<IProject>[] => {
  return [
    {
      accessorFn: (row) => row.id || "-",
      id: "Project ID",
      header: "Project ID",
      cell: ({ row }) => {
        const value = row.original?.id || "-";
        return <span>{value}</span>;
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs"
          >
            Nama Proyek
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.original?.name || "-";
        const isSetLocation = row.original?.location !== "Belum Set Lokasi";

        return (
          <div className="flex flex-col justify-center items-center gap-1">
            <div className="text-md font-bold">{value}</div>
            {!isSetLocation && (
              <div className="flex items-center gap-1 text-[9px] text-white bg-red-500 p-1 rounded-full">
                <FaLocationDot className="w-2" />
                Not Set Location
              </div>
            )}
          </div>
        );
      },
    },
    // {
    //   accessorFn: (row) => row.no_dokumen_project ?? row.id,
    //   id: "no_dokumen_project",
    //   header: "Nomor Dokumen",
    //   cell: ({ getValue }) => {
    //     const value = getValue() as string;
    //     return <span>{value}</span>;
    //   },
    // },
    {
      accessorFn: (row) => row.client?.name || "-",
      id: "client",
      header: "Klien",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span>{value}</span>;
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs"
          >
            Tanggal Proyek
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const date = getValue() as string;
        const formattedDate = date
          ? format(new Date(date), "dd MMM yyyy")
          : "-";
        return <span>{formattedDate}</span>;
      },
    },
    {
      accessorKey: "billing",
      header: "Billing",
      cell: ({ getValue }) => {
        const billingVal = getValue() as number;
        const formattedBilling = formatNumberIDR(billingVal);
        return <span>{formattedBilling}</span>;
      },
    },
    {
      accessorKey: "Estimasi Biaya",
      header: "Estimasi Biaya",
      cell: ({ row }) => {
        const costEstimate = Number(row.original.total_budgets_estimasi);
        const formattedCostEstimate = formatNumberIDR(costEstimate);
        return <span>{formattedCostEstimate}</span>;
      },
    },
    {
      accessorKey: "margin",
      header: "Keuntungan",
      cell: ({ row }) => {
        const margin = Number(row.original.margin);
        const formattedMargin = formatNumberIDR(margin);
        return <span>{formattedMargin}</span>;
      },
    },
    {
      accessorKey: "actual_margin",
      header: "Keuntungan Aktual",
      cell: ({ row }) => {
        const margin = Number(row.original.real_margin);
        const formattedMargin = formatNumberIDR(margin);
        return <span>{formattedMargin}</span>;
      },
    },
    {
      accessorKey: "Real Cost",
      header: "Real Cost",
      cell: ({ row }) => {
        const n = row.original?.cost_progress_project?.real_cost || 0;
        return <span>{formatNumberIDR(Number(n))}</span>;
      },
    },
    {
      accessorKey: "Cost Progress",
      header: "Cost Progress",
      cell: ({ row }) => {
        const n = row.original?.cost_progress_project?.percent || 0;
        return <span>({n})</span>;
      },
    },
    {
      accessorFn: (row) =>
        row.cost_progress_project?.status_cost_progres || "-",
      id: "Status Cost Progress",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cost Progress
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const value = getValue() as string;

        return (
          <span
            className={getStatusClass(value, {
              base: "p-2 rounded-xl flex items-center justify-center text-xs font-medium",
            })}
          >
            {value}
          </span>
        );
      },
    },
    {
      accessorFn: (row) => row.request_status_owner?.name || "-",
      id: "Status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status Proyek
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const value = getValue() as string;

        let statusClass = "";
        if (value === "Pending") {
          statusClass = "bg-[#FFEFC7] border border-[#FDDF8A] text-[#F58101]";
        } else if (value === "Active") {
          statusClass = "bg-[#D1FADF] border border-[#A0F2C1] text-[#22BB72]";
        } else if (value === "Rejected" || value === "Cancel") {
          statusClass = "bg-[#FEE4E2] border border-[#FDCFCB] text-[#ED271A]";
        } else if (value === "Closed") {
          statusClass = "bg-[#D1E0FF] border border-[#B2CDFF] text-[#1C69FF]";
        }

        return (
          <span
            className={`p-2 rounded-xl flex justify-center ${statusClass} `}
          >
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: "Status Termin",
      header: "Status Termin",
      cell: ({ row }) => {
        let data = row.original.type_termin_proyek?.name ?? "";
        let statusClass = "";
        if (data === "Lunas") {
          statusClass = "bg-[#F4EBFF] border border-[#E8D6FE] text-[#946AEA]";
          data = "Lunas";
        } else if (data === "Belum Lunas") {
          statusClass = "bg-[#FFEFC7] border border-[#FDDF8A] text-[#F58101]";
          data = "Belum Lunas";
        } else if (data === "Unknown" || data === "Belum Ada Pembayaran") {
          statusClass = "bg-[#FEE4E2] border border-[#FDCFCB] text-[#ED271A]";
          data = "Belum Ada Pembayaran";
        }
        return (
          <span
            className={`p-2 text-center rounded-xl flex justify-center ${statusClass} `}
          >
            {data}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const data = row.original;
        const status = row.original.request_status_owner?.name;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 cursor-pointer" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-center">
                Actions
              </DropdownMenuLabel>
              <div className="flex flex-col gap-2">
                {props.cookies?.roleId === 1 && (
                  <>
                    {status === "Pending" && (
                      <DropdownMenuItem
                        className="border border-green-500 cursor-pointer"
                        onClick={() => props.acceptProject(data.id ?? "")}
                      >
                        <FaHandshakeSimple className="text-green-500" />
                        Setujui
                      </DropdownMenuItem>
                    )}
                    {(status === "Cancel" || status === "Rejected") && (
                      <DropdownMenuItem
                        className="border border-green-500 cursor-pointer"
                        onClick={() => props.acceptProject(data.id ?? "")}
                      >
                        <FaHandshakeSimple />
                        Aktifkan
                      </DropdownMenuItem>
                    )}
                    {status !== "Rejected" && status !== "Cancel" && (
                      <DropdownMenuItem
                        className="border border-red-500 cursor-pointer"
                        onClick={() => props.cancelProject(data.id ?? "")}
                      >
                        <FaCircleXmark className="text-red-500" />
                        Cancel
                      </DropdownMenuItem>
                    )}
                    {status === "Active" && (
                      <DropdownMenuItem
                        className="border border-green-500 cursor-pointer"
                        onClick={() => props.closeProject(data.id ?? "")}
                      >
                        <FaFileCircleCheck className="text-green-500" />
                        Close Project
                      </DropdownMenuItem>
                    )}
                    {status !== "Rejected" && status !== "Cancel" && (
                      <DropdownMenuItem
                        className="border border-red-500 cursor-pointer"
                        onClick={() => props.rejectProject(data?.id ?? "")}
                      >
                        <FaHandshakeSimpleSlash className="text-red-500" />
                        Tolak
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {(props.cookies?.roleId === 1 ||
                  props.cookies?.roleId === 2) && (
                  <>
                    <DropdownMenuItem
                      className="border border-slate-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.viewDetailData(data?.id ?? "");
                      }}
                    >
                      <FaEye className="text-primary" />
                      Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="border border-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.deleteData(data?.id ?? "");
                      }}
                    >
                      <FaTrash className="text-red-400" />
                      Delete
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="border border-yellow-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.payment(data?.id ?? "");
                      }}
                    >
                      <FaMoneyBillTransfer className="text-green-500" />
                      Pembayaran
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="border border-yellow-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.locationProject(data.id);
                      }}
                    >
                      <FaLocationDot className="text-red-400" />
                      Location
                    </DropdownMenuItem>

                    {/* Pindah ke mode Budget untuk project ini */}
                    <DropdownMenuItem
                      className="border border-yellow-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.tableMode("budget", data.id);
                      }}
                    >
                      <FaFileInvoice className="text-iprimary-blue" />
                      Budget
                    </DropdownMenuItem>

                    {/* Pindah ke mode Task untuk project ini */}
                    {/* <DropdownMenuItem
                      className="border border-yellow-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.tableMode("task", data.id);
                      }}
                    >
                      <FaAlignJustify />
                      Task/Pekerjaan
                    </DropdownMenuItem> */}
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
