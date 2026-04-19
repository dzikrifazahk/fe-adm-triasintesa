"use client";

import { usePathname } from "next/navigation";
import {
  FaGears,
  FaChartPie,
  FaMoneyBills,
  FaUsers,
} from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useSidebar } from "../ui/sidebar";
import { getDictionary } from "../../../get-dictionary";
import { i18n } from "../../../i18n-config";
import { isLocale } from "@/utils/isLocale";
import { useLoading } from "@/context/loadingContext";
import Link from "next/link";
import DashboardIcon from "../icons/dashboardIC";
import InputProductionIcon from "../icons/inputProductionIC";
import InventoryIC from "../icons/inventoryIC";
import SalesOrderIC from "../icons/salesOrderIC";
import ShippingIC from "../icons/shippingIC";
import { GitPullRequestDraft, Refrigerator } from "lucide-react";

interface NavItem {
  header?: string;
  title?: string;
  icon?: React.ReactNode;
  to?: string;
}

interface SideBarDashboardProps {
  isOpen?: (value: boolean) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["primary_sidebar"];
}

export function NavItems({ isOpen, dictionary }: SideBarDashboardProps) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const locale = isLocale(segments[1]) ? segments[1] : i18n.defaultLocale;
  const [isMounted, setIsMounted] = useState(false);
  const { state } = useSidebar();

  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems: NavItem[] = [
    { header: `${dictionary.main}` },
    {
      title: `${dictionary.home}`,
      // icon: <FaHouseChimney className="hover:text-white" size={18} />,
      icon: <DashboardIcon className="w-5 h-5  hover:text-white transition" />,
      to: `/${locale}/dashboard`,
    },
    {
      title: `${dictionary.tank_refill}`,
      icon: <Refrigerator className="w-5 h-5 hover:text-white transition" />,
      to: `/${locale}/dashboard/tanks-refill`,
    },
    {
      title: `${dictionary.production}`,
      icon: <InputProductionIcon className="w-5 h-5 hover:text-white transition" />,
      to: `/${locale}/dashboard/production`,
    },
    {
      title: `${dictionary.qc}`,
      icon: <GitPullRequestDraft className="w-5 h-5 hover:text-white transition" />,
      to: `/${locale}/dashboard/qc`,
    },
    {
      title: `${dictionary.inventory}`,
      icon: <InventoryIC className="w-5 h-5 hover:text-white transition" />,
      to: `/${locale}/dashboard/inventory`,
    },
    { header: `${dictionary.sales_title}` },
    {
      title: `${dictionary.sales_order}`,
      icon: <SalesOrderIC className="w-5 h-5 hover:text-white transition" />,
      to: `/${locale}/dashboard/sales-order`,
    },
    {
      title: `${dictionary.customer}`,
      icon: <FaUsers className="hover:text-white" size={18} />,
      to: `/${locale}/dashboard/customer`,
    },
    {
      title: `${dictionary.shipping}`,
      icon: <ShippingIC className="w-5 h-5 hover:text-white transition" />,
      to: `/${locale}/dashboard/shipping`,
    },
    { header: `${dictionary.financial}` },
    {
      title: `${dictionary.financial_note}`,
      icon: <FaMoneyBills className="hover:text-white" size={18} />,
      to: `/${locale}/dashboard/financial-record`,
    },
    { header: `${dictionary.report}` },
    {
      title: `${dictionary.report}`,
      icon: <FaChartPie className="hover:text-white" size={18} />,
      to: `/${locale}/dashboard/report`,
    },
    { header: `${dictionary.configuration}` },
    {
      title: `${dictionary.settings}`,
      icon: <FaGears className="hover:text-white" size={18} />,
      to: `/${locale}/dashboard/settings`,
    },
  ];

  if (!isMounted) return null;

  const isActive = (path?: string) => {
    if (!path) return false;
    const homePath = `/${locale}/dashboard`;
    if (path === homePath) {
      return pathname === homePath;
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleNavClick = (to?: string) => {
    setIsLoading(true);

    setTimeout(() => {
      if (to) {
        window.location.href = to;
      }
    });
  };

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item, index) => {
        if (item.header) {
          if (state !== "expanded") return null;

          return (
            <div
              key={`header-${index}`}
              className="px-4 pt-4 pb-1 text-xs font-sans-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider"
            >
              {item.header}
            </div>
          );
        }

        const active = isActive(item.to);
        const activeClasses = "bg-iprimary-blue text-white font-semibold";
        const baseClasses = `
          flex items-center gap-3 px-3 py-2 rounded-lg
          transition-all text-sm
          ${state === "expanded" ? "mx-2" : ""}
        `;
        const inactiveClasses =
          "text-iprimary-blue dark:text-gray-300 hover:bg-iprimary-blue dark:hover:bg-gray-800 hover:text-white";
        if (active) {
          return (
            <div
              key={`item-${index}`}
              className={`${state === "expanded" ? "mx-2" : "mx-1"}`}
            >
              <div
                className={`${baseClasses} ${activeClasses}`}
                title={item.title}
              >
                <div>{item.icon}</div>
                {state === "expanded" && <span>{item.title}</span>}
              </div>
            </div>
          );
        }
        return (
          // <div
          //   key={`item-${index}`}
          //   className={`${state === "expanded" ? "mx-2" :"mx-1"}`}
          //   onClick={() => handleNavClick(item.to)}
          // >
          //   <div
          //     className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm cursor-pointer ${
          //       isActive(item.to)
          //         ? "bg-iprimary-blue text-white font-semibold"
          //         : "text-iprimary-blue dark:text-gray-300 hover:bg-iprimary-blue dark:hover:bg-gray-800 hover:text-white"
          //     } ${state === "expanded" ? "mx-2" : ""}`}
          //     title={item.title}
          //   >
          //     <div>{item.icon}</div>
          //     {state === "expanded" && <span>{item.title}</span>}
          //   </div>
          // </div>
          <Link
            key={`item-${index}`}
            href={item.to ?? "#"}
            className={`${state === "expanded" ? "mx-2" : "mx-1"}`}
            onClick={() => handleNavClick(item.to)}
          >
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm cursor-pointer ${
                isActive(item.to)
                  ? "bg-iprimary-blue text-white font-semibold"
                  : "text-iprimary-blue dark:text-gray-300 hover:bg-iprimary-blue dark:hover:bg-gray-800 hover:text-white"
              } ${state === "expanded" ? "mx-2" : ""}`}
              title={item.title}
            >
              <div>{item.icon}</div>
              {state === "expanded" && <span>{item.title}</span>}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
