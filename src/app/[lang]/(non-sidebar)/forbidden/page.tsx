"use client";
import { useLoading } from "@/context/loadingContext";
import { useEffect } from "react";

export default function ForbiddenPage() {
  const { setIsLoading } = useLoading();
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold font-yaro">403 - Forbidden</h1>
      <p className="text-lg mt-2">
        You do not have permission to access this page.
      </p>
    </div>
  );
}
