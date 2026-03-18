"use client";
import { useLoading } from "@/context/loadingContext";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface Props {
  lang: string;
}

export default function EmployeeButton({ lang }: Props) {
  const router = useRouter();
  const { setIsLoading } = useLoading();

  const handleChangeDashboard = () => {
    setIsLoading(true);
    router.push(`/${lang}/`);
  };

  return (
    <>
      <Label
        className="text-xs border border-gray-200 rounded-lg gap-2 cursor-pointer bg-red-500 text-white p-2"
        onClick={handleChangeDashboard}
      >
        Employee Page
      </Label>
    </>
  );
}
