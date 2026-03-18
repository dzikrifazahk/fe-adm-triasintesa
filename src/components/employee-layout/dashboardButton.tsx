"use client";
import { useLoading } from "@/context/loadingContext";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/services/base.service";

interface Props {
  lang: string;
}

export default function DashboardButton({ lang }: Props) {
  const router = useRouter();
  const { setIsLoading } = useLoading();

  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    const user = getUser(); // dipanggil setelah client mount
    setRoleId(user?.roleId ?? null);
    setIsLoading(false);
  }, []);

  const handleChangeDashboard = () => {
    setIsLoading(true);
    router.push(`/${lang}/dashboard`);
  };

  // Jangan render apapun sampai roleId didapat
  if (roleId === null) return null;

  return (
    <>
      {(roleId === 1 || roleId === 2) && (
        <Label
          className="text-xs border border-gray-200 rounded-lg gap-2 cursor-pointer bg-red-500 text-white p-2"
          onClick={handleChangeDashboard}
        >
          Dashboard
        </Label>
      )}
    </>
  );
}
