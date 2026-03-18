import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { Locale } from "../../../../../../i18n-config";
import { getDictionary } from "../../../../../../get-dictionary";
import SideBarSSR from "@/components/sideBar/sideBarSSR";
import LocaleSwitcher from "@/components/localeSwitcher";
import { FaBell, FaMagnifyingGlass } from "react-icons/fa6";
import Link from "next/link";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <div className="flex h-screen w-full max-w-[100vw] overflow-x-hidden bg-muted">
      <SidebarProvider>
        <div className="flex h-full w-full">
          <SideBarSSR dictionary={dictionary?.primary_sidebar ?? "-"} />
          <div className="flex flex-col w-full h-full min-w-0">
            <div className="h-14 flex items-center justify-between p-2 w-full sticky top-0 bg-white dark:bg-card z-10 shadow-lg">
              <div className="flex items-center w-full mt-2 h-7">
                <SidebarTrigger className="-ml-1 cursor-pointer" />
                <div className="w-full h-full flex justify-between min-w-0">
                  <Separator
                    orientation="vertical"
                    className="mr-2 h-full border-black"
                  />
                  <label className="p-2 flex border border-gray-200 dark:border-gray-500 rounded-lg gap-2 cursor-pointer w-1/2 max-w-lg items-center dark:bg-card">
                    <FaMagnifyingGlass className="text-gray-400 w-3" />
                    <input
                      className="focus:outline-none focus:bg-transparent bg-transparent text-xs text-gray-400 cursor-pointer placeholder-gray-400 w-full"
                      placeholder="Search Menu"
                    />
                  </label>
                  <div className="flex gap-3 justify-center items-center">
                    <Link href={"/dashboard/notifications"}>
                      <FaBell className="text-iprimary-blue" />
                    </Link>
                    <LocaleSwitcher />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col h-full w-full p-2 overflow-hidden min-w-0">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
