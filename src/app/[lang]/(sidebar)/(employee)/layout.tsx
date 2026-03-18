import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import EmployeeSideBarSSR from "@/components/employee-layout/sidebar/sideBarSSR";
import LocaleSwitcher from "@/components/localeSwitcher";
import { FaBell, FaMagnifyingGlass } from "react-icons/fa6";
import { Locale } from "../../../../../i18n-config";
import { getDictionary } from "../../../../../get-dictionary";
import DashboardButton from "@/components/employee-layout/dashboardButton";

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
    <>
      <SidebarProvider>
        <div className="flex flex-1  w-full">
          <EmployeeSideBarSSR dictionary={dictionary?.emp_sidebar ?? "-"} />
          <div className="flex flex-col w-full h-full ">
            <div className="flex items-center justify-between p-2 w-full sticky top-0 bg-white dark:bg-[#292A2D] z-10 shadow-lg">
              <div className="flex items-center w-full mt-2 h-7">
                <SidebarTrigger className="-ml-1 cursor-pointer" />
                <div className="w-full h-full flex justify-between ">
                  <Separator
                    orientation="vertical"
                    className="mr-2 h-full border-black"
                  />
                  <label className="p-2 flex border border-gray-200 rounded-lg gap-2 cursor-pointer w-1/2 max-w-lg items-center dark:bg-black">
                    <FaMagnifyingGlass className="text-gray-400 w-3" />
                    <input
                      className="focus:outline-none focus:bg-transparent bg-transparent text-xs text-gray-400 cursor-pointer placeholder-gray-400 w-full"
                      placeholder="Search Menu"
                    />
                  </label>

                  <div className="flex gap-3 justify-center items-center">
                    {/* <DashboardButton lang={lang} /> */}
                    <FaBell className="text-iprimary-blue" />
                    <LocaleSwitcher />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col min-h-full overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
