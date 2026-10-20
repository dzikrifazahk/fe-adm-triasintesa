"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Modal } from "@/components/custom/modal";
import { roleService } from "@/services";
import { cn } from "@/lib/utils";
import {
  Mail,
  ShieldCheck,
  User2,
  ImagePlus,
  MapPin,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { MobileContext } from "@/hooks/use-mobile-ssr";

import { useFormText } from "@/hooks/use-form-text";
type RoleOption = {
  id: string;
  name: string;
};

export type UserUpsertForm = {
  email: string;
  username: string;
  roleId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  bio: string;
  dob: string;
  gender: string;
  avatarFile: File | null;
  currentAvatarUrl: string;
};

type Props = {
  isOpen: boolean;
  title: string;
  type: "create" | "edit";
  values: UserUpsertForm;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: <K extends keyof UserUpsertForm>(
    field: K,
    value: UserUpsertForm[K],
  ) => void;
};

export function ModalUpsertUser({
  isOpen,
  title,
  type,
  values,
  onClose,
  onCancel,
  onSubmit,
  onChange,
}: Props) {
  const t = useFormText();
  const { isMobile } = useContext(MobileContext);

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const response = await roleService.getRoles();

        const rawRoles =
          response?.data?.data ??
          response?.data ??
          response?.result?.data ??
          [];

        const mappedRoles = Array.isArray(rawRoles)
          ? rawRoles.map((item: any) => ({
              id: String(item.id),
              name: item.name ?? item.roleName ?? item.label ?? "",
            }))
          : [];

        setRoles(mappedRoles);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Failed to fetch roles:", error.response?.data);
        } else {
          console.error("Failed to fetch roles:", error);
        }
      } finally {
        setIsLoadingRoles(false);
      }
    };

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const avatarPreview = useMemo(() => {
    if (!values.avatarFile) return "";
    return URL.createObjectURL(values.avatarFile);
  }, [values.avatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const currentPreview = avatarPreview || values.currentAvatarUrl || "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      onChange("avatarFile", null);
      setAvatarError("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("File harus berupa image.");
      onChange("avatarFile", null);
      e.target.value = "";
      return;
    }

    setAvatarError("");
    onChange("avatarFile", file);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={`${isMobile ? "90vw" : "80vw"}`}
      onSubmit={onSubmit}
      onCancel={onCancel}
    >
      <div className="space-y-6 p-6">
        {/* <div className="flex flex-col gap-3 rounded-2xl border bg-gradient-to-r from-muted/70 via-muted/30 to-background p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <Badge variant="secondary" className="rounded-full">
                {type === "create" ? "Create User" : "Edit User"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {type === "create"
                ? "Lengkapi data akun dan profil pengguna baru."
                : "Perbarui data akun, profil, dan foto pengguna."}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border bg-background/80 px-4 py-3 shadow-sm">
            <Avatar className="h-14 w-14 border">
              <AvatarImage src={currentPreview} alt="Avatar Preview" />
              <AvatarFallback className="text-sm font-semibold">
                {getInitials(values.fullName || values.username)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {values.fullName || "Nama pengguna"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {values.email || "email@domain.com"}
              </p>
            </div>
          </div>
        </div> */}

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="space-y-4">
            <Card className="overflow-hidden border shadow-sm">
              <CardContent className="p-4">
                <div className="mb-4 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">Profile Image</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="h-24 w-24 border-2 shadow-sm">
                      <AvatarImage src={currentPreview} alt="Avatar Preview" />
                      <AvatarFallback className="text-lg font-semibold">
                        {getInitials(values.fullName || values.username)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <label
                    htmlFor="avatar-upload"
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 px-4 py-6 text-center transition hover:bg-muted",
                      avatarError && "border-destructive",
                    )}
                  >
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Upload avatar</p>
                      <p className="text-xs text-muted-foreground">
                        Hanya file image
                      </p>
                    </div>
                  </label>

                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {values.avatarFile ? (
                    <p className="text-xs text-muted-foreground">
                      File: {values.avatarFile.name}
                    </p>
                  ) : null}

                  {avatarError ? (
                    <p className="text-xs text-destructive">{avatarError}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-semibold">Quick Summary</p>
                <SummaryItem label={t.user.username} value={values.username || "-"} />
                <SummaryItem label={t.common.email} value={values.email || "-"} />
                <SummaryItem
                  label={t.user.role}
                  value={
                    roles.find((item) => item.id === values.roleId)?.name || "-"
                  }
                />
                <SummaryItem label={t.user.gender} value={values.gender || "-"} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="border shadow-sm">
              <CardContent className="p-5">
                <SectionHeader
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Account Information"
                  description="Informasi login dan role pengguna."
                />

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <FormInput
                    label={t.common.email}
                    value={values.email}
                    onChange={(val) => onChange("email", val)}
                    placeholder={t.user.emailPlaceholder}
                    required
                    icon={<Mail className="h-4 w-4" />}
                  />

                  <FormInput
                    label={t.user.username}
                    value={values.username}
                    onChange={(val) => onChange("username", val)}
                    placeholder={t.user.usernamePlaceholder}
                    required
                    icon={<User2 className="h-4 w-4" />}
                  />
                </div>
                <div className="w-full gap-2 mt-2">
                  <Label className="text-sm font-medium">
                    {t.user.role} <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    options={roles.map((role) => ({
                      value: role.id,
                      label: role.name,
                    }))}
                    value={values.roleId}
                    onValueChange={(val) => onChange("roleId", val)}
                    placeholder={
                      isLoadingRoles ? "Loading..." : t.user.selectRole
                    }
                    searchPlaceholder={t.user.searchRole}
                    disabled={isLoadingRoles}
                    className="h-11 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-5">
                <SectionHeader
                  icon={<MapPin className="h-4 w-4" />}
                  title="Personal Information"
                  description="Informasi personal dan profil pengguna."
                />

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <FormInput
                    label={t.user.fullName}
                    value={values.fullName}
                    onChange={(val) => onChange("fullName", val)}
                    placeholder={t.user.fullNamePlaceholder}
                    required
                  />

                  <FormInput
                    label={t.user.phone}
                    value={values.phone}
                    onChange={(val) => onChange("phone", val)}
                    placeholder="08xxxxxxxxxx"
                  />

                  <FormInput
                    label={t.user.city}
                    value={values.city}
                    onChange={(val) => onChange("city", val)}
                    placeholder={t.user.cityPlaceholder}
                  />

                  <FormInput
                    label={t.user.country}
                    value={values.country}
                    onChange={(val) => onChange("country", val)}
                    placeholder={t.user.countryPlaceholder}
                  />

                  <FormInput
                    label={t.user.postalCode}
                    value={values.postalCode}
                    onChange={(val) => onChange("postalCode", val)}
                    placeholder={t.user.postalCodePlaceholder}
                  />

                  <FormInput
                    label={t.user.dateOfBirth}
                    type="date"
                    value={values.dob}
                    onChange={(val) => onChange("dob", val)}
                  />

                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">{t.user.gender}</Label>
                    <Combobox
                      options={[
                        { value: "male", label: t.user.male },
                        { value: "female", label: t.user.female },
                      ]}
                      value={values.gender}
                      onValueChange={(val) => onChange("gender", val)}
                      placeholder={t.user.selectGender}
                      searchPlaceholder={t.user.searchGender}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="grid gap-4">
                  <FormInput
                    label={t.user.address}
                    value={values.address}
                    onChange={(val) => onChange("address", val)}
                    placeholder={t.user.addressPlaceholder}
                  />

                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">{t.user.bio}</Label>
                    <Textarea
                      value={values.bio}
                      onChange={(e) => onChange("bio", e.target.value)}
                      placeholder={t.user.bioPlaceholder}
                      className="min-h-[110px] rounded-xl resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-muted p-2 text-muted-foreground">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[120px] truncate text-right font-medium">
        {value}
      </span>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </Label>

      <div className="relative">
        {icon ? (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        ) : null}

        <Input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn("h-11 rounded-xl", icon && "pl-10")}
        />
      </div>
    </div>
  );
}
