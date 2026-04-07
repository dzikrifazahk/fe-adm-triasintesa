import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { getUser } from "@/services/base.service";
import { useEffect, useState } from "react";
import {
  FaEye,
  FaLocationArrow,
  FaPencil,
  FaRepeat,
  FaRoadLock,
  FaTrash,
} from "react-icons/fa6";
import { IUser } from "@/types/user";
import { getDictionary } from "../../../../get-dictionary";

type childProps = {
  detailData: (data: IUser) => void;
  deleteData: (id: string) => void;
  editData: (id: string) => void;
  resetPassword: (id: string) => void;
  unActiveUser: (id: string, status: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_users"];
  resendPassword: (id: string) => void;
};

export const columns = (props: childProps): ColumnDef<IUser>[] => {
  const [role, setRole] = useState<number | null>(null);

  useEffect(() => {
    const user = getUser();
    if (user && user.roleId) {
      setRole(Number(user.roleId));
    }
  }, []);

  const renderActions = (uid: IUser) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-center">Actions</DropdownMenuLabel>
          <div className="flex flex-col gap-2">
            <DropdownMenuItem
              className="border border-slate-500 cursor-pointer"
              onClick={() => props.detailData(uid)}
            >
              <FaEye className="text-primary" />
              Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border border-red-500 cursor-pointer"
              onClick={() => props.deleteData(uid.id ?? "")}
            >
              <FaTrash className="text-red-500" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border border-yellow-500 cursor-pointer"
              onClick={() => props.editData(uid.id ?? "")}
            >
              <FaPencil className="text-yellow-400" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border border-yellow-500 cursor-pointer"
              onClick={() => props.resendPassword(uid.id ?? "")}
            >
              <FaLocationArrow className="text-blue-500" />
              Kirim Ulang Password
            </DropdownMenuItem>
            {(role === 1 || role === 2) && (
              <>
                <DropdownMenuItem
                  className="border border-yellow-500 cursor-pointer"
                  onClick={() => props.resetPassword(uid.id ?? "")}
                >
                  <FaRepeat className="text-blue-500" />
                  Reset Password
                </DropdownMenuItem>
                {/* <DropdownMenuItem
                  className="border border-red-500 cursor-pointer"
                  onClick={() =>
                    props.unActiveUser(uid.id ?? "", uid.status_users ?? "")
                  }
                >
                  <FaRoadLock
                    className={`${
                      uid.status_users === "Aktif"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  />
                  {uid.status_users === "Aktif"
                    ? "Nonaktifkan Pegawai"
                    : "Aktifkan Pegawai"}
                </DropdownMenuItem> */}
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.userDetail?.fullName || "-",
      id: "fullName",
      header: "Full Name",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span>{value}</span>;
      },
    },
    {
      accessorKey: "username",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {props.dictionary.column.name}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorFn: (row) => row.role?.name || "-",
      id: "role",
      header: props.dictionary.column.role,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span>{value}</span>;
      },
    },
    // {
    //   accessorFn: (row) => row.status_users || "-",
    //   id: "status",
    //   header: props.dictionary.column.status,
    //   cell: ({ getValue }) => {
    //     const value = getValue() as string;

    //     const isActive = value.toUpperCase() === "AKTIF";
    //     const bgColor = isActive ? "bg-green-100" : "bg-red-100";
    //     const textColor = isActive ? "text-green-700" : "text-red-700";

    //     return (
    //       <div className="w-full flex justify-center">
    //         <span
    //           className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}
    //         >
    //           {value}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "actions",
      header: props.dictionary.column.actions,
      cell: ({ row }) => {
        const uid = row.original;
        return renderActions(uid);
      },
    },
  ];
};
