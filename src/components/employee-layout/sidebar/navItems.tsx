"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHouseChimney,
  FaFileCirclePlus,
  FaGears,
  FaCube,
  FaChartPie,
  FaMoneyBills,
  FaNoteSticky,
  FaMoneyBillTrendUp,
  FaBusinessTime,
  FaHandHoldingDollar,
} from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { getDictionary } from "../../../../get-dictionary";
import { i18n } from "../../../../i18n-config";
import { isLocale } from "@/middleware";
import { useLoading } from "@/context/loadingContext";

interface NavItem {
  header?: string;
  title?: string;
  icon?: React.ReactNode;
  to?: string;
}

interface SideBarDashboardProps {
  isOpen?: (value: boolean) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["emp_sidebar"];
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
      icon: <FaHouseChimney className="hover:text-white" size={18} />,
      to: `/${locale}`,
    },
    {
      title: `${dictionary.attendance}`,
      icon: <FaCube className="hover:text-white" size={18} />,
      to: `/${locale}/attendance`,
    },
    {
      title: `${dictionary.overtime}`,
      icon: <FaBusinessTime className="hover:text-white" size={18} />,
      to: `/${locale}/overtime`,
    },
    {
      title: `${dictionary.cash_advance}`,
      icon: <FaHandHoldingDollar className="hover:text-white" size={18} />,
      to: `/${locale}/cash-advance`,
    },
    {
      title: `${dictionary.payroll}`,
      icon: <FaMoneyBillTrendUp className="hover:text-white" size={18} />,
      to: `/${locale}/payroll`,
    },
    {
      title: `${dictionary.purchase}`,
      icon: <FaNoteSticky className="hover:text-white" size={18} />,
      to: `/${locale}/purchase`,
    }
    // {
    //   title: `${dictionary.report}`,
    //   icon: <FaChartPie className="hover:text-white" size={18} />,
    //   to: `/${locale}/report`,
    // },
  ];

  if (!isMounted) return null;

  const isActive = (path?: string) => path === pathname;

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

        return (
          <div
            key={`item-${index}`}
            className={`${state === "expanded" && "mx-2"}`}
            onClick={() => handleNavClick(item.to)}
          >
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm cursor-pointer ${
                isActive(item.to)
                  ? "bg-iprimary-blue text-white font-semibold"
                  : "text-iprimary-blue dark:text-gray-300 hover:bg-iprimary-blue dark:hover:bg-gray-800 hover:text-white"
              } ${state === "expanded" ? "mx-2" : ""}`}
              title={item.title}
            >
              <div>{item.icon}</div>
              {state === "expanded" && <span>{item.title}</span>}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
