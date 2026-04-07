"use client";
import { useSidebar } from "../ui/sidebar";
import Logo from "../logo";
import LogoNoName from "../logoNoName";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { getDictionary } from "../../../get-dictionary";
import { Separator } from "../ui/separator";

type NavHeaderProps = {
  isOpenSearchModalMobile: (val: boolean) => void;
};

export default function NavHeader({
  isOpenSearchModalMobile,
}: NavHeaderProps) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {state === "collapsed" && (
        <div
          className={`transition-all duration-300 ease-in-out ${
            state === "collapsed" ? "scale-100" : "scale-0"
          }`}
        >
          <LogoNoName hSize="h-8" />
        </div>
      )}
      {state === "expanded" && (
        <div className={`transition-all duration-300 ease-in-out`}>
          <div className="flex w-full justify-center">
            {theme === "dark" ? (
              <Logo hSize="h-12" />
            ) : (
              <Logo hSize="h-16" />
            )}
          </div>
        </div>
      )}

      <div
        className={`flex justify-center items-center gap-2 transition-all duration-300 ease-in-out ${
          state === "collapsed" ? "flex-col" : "flex-row"
        }`}
      >
        <Separator />
      </div>
    </>
  );
}
