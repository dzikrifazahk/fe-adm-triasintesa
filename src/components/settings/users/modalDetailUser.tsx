"use client";

import { ModalDetail } from "@/components/custom/modalDetail";
import { IUser } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/utils/getInitials";

interface DetailModalUserProps {
  data?: IUser | null;
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  onCancel: () => void;
}

export const DetailModalUser = ({
  data,
  isOpen,
  title,
  onClose,
  onSubmit,
  onCancel,
}: DetailModalUserProps) => {
  const fullName = data?.userDetail?.fullName ?? "";
  const avatarUrl =
    data?.userDetail?.avatarUrl && data.userDetail.avatarUrl.startsWith("http")
      ? data.userDetail.avatarUrl
      : undefined;

  const genderLabel =
    data?.userDetail?.gender === "male"
      ? "Male"
      : data?.userDetail?.gender === "female"
        ? "Female"
        : "-";

  const permissions = data?.role?.permissions ?? {};

  return (
    <ModalDetail
      isOpen={isOpen}
      title={title ?? "Detail Pengguna"}
      width="w-[95vw] max-w-[950px]"
      onClose={onClose}
      onSubmit={onSubmit}
      onCancel={onCancel}
    >
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          {/* HEADER */}
          <div className="rounded-2xl border bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <Avatar className="h-24 w-24 border shadow-sm">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="text-xl font-semibold">
                  {getInitials(
                    fullName || data?.username || data?.email || "-",
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {fullName || "-"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {data?.email || "-"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {data?.role?.displayName || data?.role?.name || "No Role"}
                  </Badge>
                  <Badge variant="outline">
                    Username: {data?.username || "-"}
                  </Badge>
                  <Badge variant="outline">{genderLabel}</Badge>
                  <Badge variant="outline">
                    {data?.userDetail?.country || "-"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* ACCOUNT & PERSONAL INFO */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="Account Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem label="Email" value={data?.email} />
                <InfoItem label="Username" value={data?.username} />
                <InfoItem label="Role Name" value={data?.role?.name} />
                <InfoItem
                  label="Role Display Name"
                  value={data?.role?.displayName}
                />
                <InfoItem
                  label="Role Description"
                  value={data?.role?.description}
                />
                <InfoItem
                  label="Last Login"
                  value={
                    data?.lastLoginAt
                      ? new Date(data.lastLoginAt).toLocaleString()
                      : "-"
                  }
                />
              </div>
            </SectionCard>

            <SectionCard title="Personal Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Full Name"
                  value={data?.userDetail?.fullName}
                />
                <InfoItem label="Phone" value={data?.userDetail?.phoneNumber} />
                <InfoItem label="Gender" value={genderLabel} />
                <InfoItem label="Country" value={data?.userDetail?.country} />
                <InfoItem label="City" value={data?.userDetail?.city} />
                <InfoItem
                  label="Postal Code"
                  value={data?.userDetail?.postalCode}
                />
                <InfoItem
                  label="Date of Birth"
                  value={
                    data?.userDetail?.dateOfBirth
                      ? new Date(
                          data.userDetail.dateOfBirth,
                        ).toLocaleDateString()
                      : "-"
                  }
                />
                <InfoItem label="Address" value={data?.userDetail?.address} />
              </div>
            </SectionCard>
          </div>

          {/* PERMISSIONS */}
          <SectionCard title="Permissions">
            {Object.keys(permissions).length > 0 ? (
              <div className="space-y-5">
                {Object.entries(permissions).map(([resource, items]) => (
                  <div
                    key={resource}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold capitalize text-slate-800">
                          {resource}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {items.length} permission
                          {items.length > 1 ? "s" : ""}
                        </p>
                      </div>

                      <Badge variant="secondary">{items.length}</Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {items.map((permission) => (
                        <div
                          key={permission.id}
                          className="rounded-xl border bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {permission.permission}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {permission.description || "-"}
                              </p>
                            </div>

                            <Badge variant="outline" className="capitalize">
                              {permission.action}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="Tidak ada permission yang terdaftar pada role ini." />
            )}
          </SectionCard>

          {/* METADATA */}
          <SectionCard title="Metadata">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* <InfoItem label="ID" value={data?.id} /> */}
              {/* <InfoItem label="Role ID" value={data?.roleId} /> */}
              {/* <InfoItem label="Version" value={data?.version} /> */}
              {/* <InfoItem label="Created By" value={data?.createdBy} />
              <InfoItem label="Updated By" value={data?.updatedBy} /> */}
              <InfoItem
                label="Created At"
                value={
                  data?.createdAt
                    ? new Date(data.createdAt).toLocaleString()
                    : "-"
                }
              />
              <InfoItem
                label="Updated At"
                value={
                  data?.updatedAt
                    ? new Date(data.updatedAt).toLocaleString()
                    : "-"
                }
              />
              <InfoItem
                label="Deleted At"
                value={
                  data?.deletedAt
                    ? new Date(data.deletedAt).toLocaleString()
                    : "-"
                }
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </ModalDetail>
  );
};

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
};

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value !== null && value !== undefined && value !== "" ? value : "-"}
      </p>
    </div>
  );
};

const EmptyState = ({ text }: { text: string }) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
};
