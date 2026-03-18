"use client";
import { useLoading } from "@/context/loadingContext";
import { useEffect } from "react";
import Image from "next/image";
import Default from "@/assets/img/default-settings.svg";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDictionary } from "../../../get-dictionary";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["menu_bar_settings"];
}

export default function DefaultSettingsPage({ dictionary }: Props) {
  const { setIsLoading } = useLoading();
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <div className="w-full min-h-full grid place-items-center p-10 dark:bg-card bg-white border rounded-lg">
        <div className="flex flex-col gap-5 items-center">
          <Image src={Default} alt="default" className="w-64" />
          <div className="flex flex-col gap-1 items-center">
            <div className="text-xl font-yaro font-bold text-[#4C4D4F] dark:text-white">
              {dictionary.default_page_title}
            </div>
            <div className="text-sm font-sans text-[#4C4D4F] dark:text-white">
              {dictionary.default_page_description}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
