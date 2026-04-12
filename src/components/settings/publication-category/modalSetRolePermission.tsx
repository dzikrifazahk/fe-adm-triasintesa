import { IRole } from "@/types/role";
import { getDictionary } from "../../../../get-dictionary";
import { Modal } from "@/components/custom/modal";
import { permissionService } from "@/services";
import { IPermissions } from "@/types/permission";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

interface ModalSetPermission {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_roles"];
  isOpen: boolean;
  title: string;
  detailData?: IRole | null;
  modalType: "create" | "edit" | "detail" | "assignPermission" | null;
  onClose: () => void;
  isGetData: () => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

export const ModalSetRolePermission = ({
  isOpen,
  title,
  onClose,
  modalType,
  isGetData,
  detailData,
  isLoading = false,
  setIsLoading,
}: ModalSetPermission) => {
  const [permissionsData, setPermissionsData] = useState<
    Record<string, IPermissions[]>
  >({});
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );

  const getPermissions = async () => {
    try {
      const response = await permissionService.getPermissions({});
      const groupedPermissions = response?.data?.data || response?.data || {};
      setPermissionsData(groupedPermissions);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal mengambil data permission",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const extractAssignedPermissionIds = (role?: IRole | null): string[] => {
    if (!role?.permissions) return [];

    return Object.values(role.permissions)
      .flat()
      .map((item) => item.id)
      .filter(Boolean);
  };

  const assignedPermissionIds = useMemo(() => {
    return extractAssignedPermissionIds(detailData);
  }, [detailData]);

  const allPermissionIds = useMemo(() => {
    return Object.values(permissionsData)
      .flat()
      .map((permission) => permission.id)
      .filter(Boolean);
  }, [permissionsData]);

  const isAllSelected =
    allPermissionIds.length > 0 &&
    allPermissionIds.every((id) => selectedPermissionIds.includes(id));

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const toggleGroup = (groupPermissions: IPermissions[]) => {
    const groupIds = groupPermissions.map((item) => item.id).filter(Boolean);
    const isGroupFullySelected = groupIds.every((id) =>
      selectedPermissionIds.includes(id),
    );

    setSelectedPermissionIds((prev) => {
      if (isGroupFullySelected) {
        return prev.filter((id) => !groupIds.includes(id));
      }

      return Array.from(new Set([...prev, ...groupIds]));
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedPermissionIds([]);
    } else {
      setSelectedPermissionIds(allPermissionIds);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!detailData?.id) {
      Swal.fire({
        icon: "warning",
        title: "Role tidak ditemukan",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const payload = {
      permissionIds: selectedPermissionIds,
    };

    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menyimpan permission role ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setIsLoading?.(true);

        const response = await permissionService.assignPermissionsToRole(
          detailData.id,
          payload,
        );

        await isGetData();

        Swal.fire({
          icon: "success",
          title: response?.message || "Permission role berhasil disimpan",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });

        onClose();
      } catch (error) {
        console.error(error);

        let errorMessage = "Terjadi kesalahan";

        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message;

          if (typeof message === "string") {
            errorMessage = message;
          } else if (message && typeof message === "object") {
            errorMessage = Object.entries(message)
              .map(
                ([field, messages]) =>
                  `${field}: ${(messages as string[]).join(", ")}`,
              )
              .join(" | ");
          }
        }

        Swal.fire({
          icon: "error",
          title: errorMessage,
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2500,
        });
      } finally {
        setIsLoading?.(false);
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      getPermissions();
      setSelectedPermissionIds(extractAssignedPermissionIds(detailData));
    }
  }, [isOpen, detailData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onCancel={onClose}
      onSubmit={handleSubmit}
      showConfirmButton={modalType === "assignPermission"}
    >
      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Assign Permission
              </p>
              <p className="text-xs text-slate-500">
                Role:{" "}
                <span className="font-medium">
                  {detailData?.displayName || detailData?.name || "-"}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={toggleSelectAll}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {isAllSelected ? "Unselect All" : "Select All"}
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>
              Total terpilih:{" "}
              <span className="font-semibold text-slate-700">
                {selectedPermissionIds.length}
              </span>
            </span>
            <span>
              Sudah dimiliki role:{" "}
              <span className="font-semibold text-emerald-600">
                {assignedPermissionIds.length}
              </span>
            </span>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {Object.keys(permissionsData).length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              Tidak ada data permission
            </div>
          ) : (
            Object.entries(permissionsData).map(([groupName, permissions]) => {
              const groupIds = permissions
                .map((item) => item.id)
                .filter(Boolean);
              const selectedCount = groupIds.filter((id) =>
                selectedPermissionIds.includes(id),
              ).length;
              const existingCount = groupIds.filter((id) =>
                assignedPermissionIds.includes(id),
              ).length;
              const isGroupChecked =
                groupIds.length > 0 && selectedCount === groupIds.length;

              return (
                <div
                  key={groupName}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold capitalize text-slate-800">
                        {groupName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {selectedCount}/{groupIds.length} dipilih •{" "}
                        {existingCount} sudah ada
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleGroup(permissions)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        isGroupChecked
                          ? "border-red-200 bg-red-50 text-red-600"
                          : "border-emerald-200 bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {isGroupChecked ? "Unselect Group" : "Select Group"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {permissions.map((permission) => {
                      const checked = selectedPermissionIds.includes(
                        permission.id,
                      );
                      const alreadyAssigned = assignedPermissionIds.includes(
                        permission.id,
                      );

                      return (
                        <label
                          key={permission.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                            checked
                              ? "border-emerald-300 bg-emerald-50"
                              : alreadyAssigned
                                ? "border-blue-200 bg-blue-50"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(permission.id)}
                            className="mt-1 h-4 w-4 rounded border-slate-300"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-slate-800">
                                {permission.permission || "-"} (
                                {`${permission.action || ""}`.toUpperCase()})
                              </p>

                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  alreadyAssigned
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {alreadyAssigned ? "Sudah ada" : "Belum ada"}
                              </span>
                            </div>

                            <p className="mt-1 break-words text-xs text-slate-500">
                              {permission.description || permission.id}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
