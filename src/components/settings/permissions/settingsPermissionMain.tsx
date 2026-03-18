"use client";

import { Button } from "@/components/ui/button";
import { getDictionary } from "../../../../get-dictionary";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import PermissionTable from "./data-table";
import { Separator } from "@/components/ui/separator";
import { useLoading } from "@/context/loadingContext";
import { getUser } from "@/services/base.service";
import { permissionService } from "@/services";
import { IPermissions, IPermissionsDetail } from "@/types/permission";
import AddModalPermission from "./addPermissionModal";
export default function SettingsPermissionMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_permission"];
}) {
  const { setIsLoading } = useLoading();
  const [isPermissionLayout, setIsPermissionLayout] = useState(true);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionsData, setPermissionsData] = useState<IPermissions[]>([]);
  const [selectedPermission, setSelectedPermission] =
    useState<IPermissionsDetail>();
  const [isEdit, setIsEdit] = useState(false);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const userProfile = getUser();
  const [selectedTable, setSelectedTable] = useState<string>("all");

  const getPermissions = async (permissionId?: number) => {
    try {
      const filterParams: Record<string, any> = {};
      if (permissionId) {
        filterParams.permission_id = permissionId;
      }

      const { data } = await permissionService.getPermissions(filterParams);
      if (permissionId) {
        setSelectedPermission(data.permission);
      } else {
        setPermissionsData(data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleOpenAddModal = () => {
    if (isPermissionLayout) {
      setIsPermissionModalOpen(true);
      setTitle("Add Permission");
    } else {
    }
  };

  const handleCloseAddModal = () => {
    if (isPermissionLayout) {
      setIsPermissionModalOpen(false);
      setIsEdit(false);
    } else {
    }
  };

  const handleSubmit = () => {};

  const handleGetData = () => {
    getPermissions();
  };

  const handleDeletePermission = async (id: number) => {
    Swal.fire({
      icon: "warning",
      text: "Are You Sure Want To Delete Data?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#32BCAD",
      denyButtonText: "No",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          const response = await permissionService.deletePermission(id);
          getPermissions();
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `Success Delete Data`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (err) {
          setIsLoading(false);
          console.error(err);
          Swal.fire({
            icon: "error",
            title: `Failed Delete Data`,
            text: `Error when delete data`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    });
  };

  const handleEditPermission = async (id: number, selectedTable: string) => {
    setIsPermissionModalOpen(true);
    setSelectedTable(selectedTable);
    setTitle("Edit Permission");
    setIsEdit(true);
    getPermissions(id);
  };

  useEffect(() => {
    getPermissions();
    setIsLoading(false);
  }, []);
  
  return (
    <>
      <div className="p-5">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <div className="font-sans-bold text-lg">{dictionary.title}</div>
            <div className="font-sans text-sm text-gray-500 dark:text-gray-200">
              {dictionary.description}
            </div>
          </div>
        </div>
        <Separator className="mt-3" />
        <div className="mt-3">
          {/* {isPermissionLayout && ( */}
          <>
            <div className="flex justify-between w-full gap-2 bg-white p-3 rounded-lg shadow-lg mt-5 dark:bg-black">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-gray-200 font-yaro font-bold text-xs bg-iprimary-red text-white hover:bg-red-500 hover:text-white cursor-pointer"
                  onClick={() => handleOpenAddModal()}
                >
                  Add Data
                </Button>
              </div>
              {/* <div>
                <Input
                  placeholder="Search Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-lg"
                />
              </div> */}
            </div>
            <div className="">
              <PermissionTable
                data={permissionsData}
                onDelete={handleDeletePermission}
                onEdit={handleEditPermission}
              />
            </div>
          </>
        </div>
      </div>
      {isPermissionModalOpen && (
        <AddModalPermission
          isOpen={isPermissionModalOpen}
          onClose={handleCloseAddModal}
          title={title}
          width="w-[80vw]"
          onSubmit={handleSubmit}
          onCancel={handleCloseAddModal}
          isGetData={handleGetData}
          data={permissionsData}
          isEdit={isEdit}
          selectedData={selectedPermission}
          selectedTable={selectedTable}
        />
      )}
    </>
  );
}
