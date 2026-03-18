import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import PermissionTable from "./data-table";
import {
  IAddOrUpdatePermissionsRequest,
  IPermissions,
  IPermissionsDetail,
} from "@/types/permission";
import Swal from "sweetalert2";
import { getUser } from "@/services/base.service";
import { permissionService } from "@/services";
import { useLoading } from "@/context/loadingContext";
import { ComboboxWithoutIC } from "@/components/custom/comboboxWithoutIC";
import { IComboboxWithoutIC } from "@/types/common";
import { Modal } from "@/components/custom/modal";

interface AddModalPermissionProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  onSubmit?: (payload: any) => void;
  onCancel?: () => void;
  isGetData: () => void;
  data: IPermissions[];
  selectedData?: IPermissionsDetail;
  isEdit?: boolean;
  selectedTable: string;
}

export default function AddModalPermission({
  isOpen,
  onClose,
  title,
  width = "w-[90vw]",
  onSubmit,
  onCancel,
  isGetData,
  data,
  selectedData,
  isEdit,
  selectedTable,
}: AddModalPermissionProps) {
  const { setIsLoading } = useLoading();
  const [permissionName, setPermissionName] = useState<string>("");
  const userProfile = getUser();
  const [selectedParentPermission, setSelectedParentPermission] =
    useState<IComboboxWithoutIC<IPermissions> | null>(null);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [permissions, setPermissions] = useState<
    IComboboxWithoutIC<IPermissions>[]
  >([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    Swal.fire({
      icon: "warning",
      text: "Are You Sure Want To Submit Data?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#32BCAD",
      denyButtonText: "No",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);

        const payload: IAddOrUpdatePermissionsRequest = {
          name: permissionName,
          parent_id: selectedParentPermission?.value,
        };

        try {
          const response = await permissionService.addOrUpdatePermissions(
            payload
          );

          isGetData();
          setIsLoading(false);
          onClose();
          Swal.fire({
            icon: "success",
            title: `Success Updating Data`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (err) {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: `Failed Updating Data`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
          console.error(err);
        }
      }
    });
  };

  const flattenPermissions = (
    permissions: IPermissions[],
    prefix = ""
  ): IComboboxWithoutIC<IPermissions>[] => {
    return permissions.flatMap((item) => {
      //   const label = prefix ? `${prefix} > ${item.name}` : item.name;
      const label = item.name;
      const entry: IComboboxWithoutIC<IPermissions> = {
        label: label,
        value: item.id.toString(),
      };
      const children =
        item.children && item.children.length > 0
          ? flattenPermissions(item.children, label)
          : [];

      return [entry, ...children];
    });
  };

  useEffect(() => {
    if (Array.isArray(data)) {
      const flattened = flattenPermissions(data);
      setPermissions(flattened);
    }
  }, [data]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        width={width}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        overflowScroll="overflow-hidden"
      >
        <div className="p-5 flex flex-col w-full h-full gap-5">
          <div className="flex flex-col min-h-0 md:flex-row gap-5">
            <div className="flex flex-col gap-3 w-full md:w-[60%] sticky top-0 z-50 h-auto">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 w-full">
                  <Label className="flex">
                    Permission Name <p className="text-red-500">*</p>
                  </Label>
                  <Input
                    className="w-full"
                    onChange={(e) => setPermissionName(e.target.value)}
                    placeholder="Permission Name"
                    value={permissionName}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label className="flex gap-1">
                  Parent Permission
                  <p className="text-red-500 text-xs">
                    (empty if there is no parent)
                  </p>
                </Label>
                <ComboboxWithoutIC
                  data={permissions}
                  selectedItem={selectedParentPermission}
                  onSelect={setSelectedParentPermission}
                  isOpen={isPopoverOpen}
                  onOpenChange={setPopoverOpen}
                  placeholder="Search Parent Permission"
                  height="h-10"
                />
              </div>
            </div>
            <div className="w-full max-h-[60vh] overflow-y-auto">
              <PermissionTable data={data} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
