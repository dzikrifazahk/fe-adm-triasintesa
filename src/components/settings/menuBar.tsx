"use client";

import { getDictionary } from "../../../get-dictionary";
import InputWithIC from "@/components/custom/inputWithIC";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import SearchIc from "@/assets/ic/search-ic.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "@/context/loadingContext";
import { useContext, useState } from "react";
import {
  FaChildReaching,
  FaHelmetSafety,
  FaHourglassHalf,
  FaMoneyBillTransfer,
  FaPassport,
  FaPeopleGroup,
  FaPersonMilitaryToPerson,
  FaUserLock,
  FaWrench,
} from "react-icons/fa6";
import clsx from "clsx";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";

/* ─────────────────────────── Types ─────────────────────────── */
interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["menu_bar_settings"];
  children: React.ReactNode;
}

interface SubItems {
  name: string;
  icons: React.ReactNode;
  to: string;
}

/** Node menu bisa jadi header atau item */
type NavNode =
  | { kind: "header"; title: string }
  | {
      kind: "item";
      title: string;
      icon: React.ReactNode;
      to: string;
      subItems?: SubItems[];
    };

/* ─────────────────────────── Component ─────────────────────────── */
export function MenuBar({ dictionary, children }: Props) {
  const pathname = usePathname();
  const { setIsLoading } = useLoading();
  const { isMobile } = useContext(MobileContext);

  const locale = pathname.split("/")[1] || "";
  const buildFull = (to: string) => `/${locale}${to}`;

  const isActive = (to: string) => {
    const full = buildFull(to);
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const SECTION = {
    system: (dictionary as any)?.system_configuration ?? "System Configuration",
    employee: (dictionary as any)?.employee ?? "Employee",
    resources: (dictionary as any)?.resources ?? "Resources",
  };

  const menu: NavNode[] = [
    // ——— Employee ———
    { kind: "header", title: SECTION.employee },
    {
      kind: "item",
      title: dictionary.users,
      icon: <FaPeopleGroup size={18} />,
      to: "/dashboard/settings/users",
    },
    {
      kind: "item",
      title: dictionary.divisions,
      icon: <FaPersonMilitaryToPerson size={18} />,
      to: "/dashboard/settings/divisions",
    },
    // {
    //   kind: "item",
    //   title: dictionary.users_divisions,
    //   icon: <FaChildReaching size={20} />,
    //   to: "/dashboard/settings/users",
    //   subItems: [
    //     {
    //       name: dictionary.users,
    //       icons: <FaPeopleGroup size={18} />,
    //       to: "/dashboard/settings/users",
    //     },
    //     {
    //       name: dictionary.divisions,
    //       icons: <FaPersonMilitaryToPerson size={18} />,
    //       to: "/dashboard/settings/divisions",
    //     },
    //   ],
    // },
    // ——— Resources ———
    { kind: "header", title: SECTION.resources },
    {
      kind: "item",
      title: dictionary.projects,
      icon: <FaHelmetSafety size={20} />,
      to: "/dashboard/settings/projects",
    },
    {
      kind: "item",
      title: dictionary.tax,
      icon: <FaMoneyBillTransfer size={20} />,
      to: "/dashboard/settings/tax",
    },
    {
      kind: "item",
      title: dictionary.contact,
      icon: <FaPassport size={20} />,
      to: "/dashboard/settings/contacts",
    },
    // ——— System Configuration ———
    { kind: "header", title: SECTION.system },
    {
      kind: "item",
      title: "Operation",
      icon: <FaHourglassHalf size={20} />,
      to: "/dashboard/settings/operation",
    },
    {
      kind: "item",
      title: dictionary.permissions,
      icon: <FaUserLock size={20} />,
      to: "/dashboard/settings/permissions",
    },
    {
      kind: "item",
      title: dictionary.theme,
      icon: <FaWrench size={20} />,
      to: "/dashboard/settings/theme",
    },
  ];

  /* ──────────────────────────── MOBILE ──────────────────────────── */
  if (isMobile) {
    return (
      <div className="flex flex-col w-full h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto ">
          {children}
        </div>

        <nav className="fixed bottom-0 left-0 w-full h-16 bg-iprimary-gray dark:bg-black border-t z-20 rounded-t-2xl overflow-x-auto">
          <div className="flex items-center flex-nowrap space-x-4 px-4 mt-2">
            {menu.map((node, i) => {
              if (node.kind === "header") {
                // di bottom-nav mobile, header di-skip (hanya item)
                return null;
              }
              const item = node;
              if (item.subItems) {
                return (
                  <Popover key={`mob-pop-${i}`}>
                    <PopoverTrigger asChild>
                      <button
                        className={clsx(
                          "flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-md transition-colors",
                          isActive(item.to)
                            ? "bg-iprimary-blue text-white"
                            : "text-iprimary-blue  hover:bg-iprimary-blue hover:text-white dark:text-white dark:hover:text-white"
                        )}
                      >
                        {item.icon}
                        <span className="mt-1 text-xs text-center">
                          {item.title}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-2 bg-white dark:bg-[#2e2e2e] rounded-lg shadow-md w-auto">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.to}
                          href={buildFull(sub.to)}
                          className={clsx(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors whitespace-nowrap",
                            isActive(sub.to)
                              ? "bg-iprimary-blue text-white"
                              : "text-iprimary-blue hover:bg-iprimary-blue hover:text-white"
                          )}
                          onClick={() => setIsLoading(true)}
                        >
                          {sub.icons}
                          <span>{sub.name}</span>
                        </Link>
                      ))}
                    </PopoverContent>
                  </Popover>
                );
              }
              return (
                <Link
                  key={`mob-item-${i}`}
                  href={buildFull(item.to)}
                  className={clsx(
                    "flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-md transition-colors",
                    isActive(item.to)
                      ? "bg-iprimary-blue text-white"
                      : "text-iprimary-blue hover:bg-iprimary-blue hover:text-white"
                  )}
                  onClick={() => setIsLoading(true)}
                >
                  {item.icon}
                  <span className="mt-1 text-xs">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  /* ─────────────────────────── DESKTOP / TABLET ─────────────────────────── */
  return (
    <div className="h-full w-full overflow-hidden">
      <div className="flex h-full max-w-[100vw] gap-2 ">
        {/* Sidebar */}
        {!sidebarCollapsed && (
          <aside
            className={clsx(
              "hidden md:flex flex-col bg-white dark:bg-card rounded-lg border",
              "overflow-y-auto min-h-0",
              "transition-[width] duration-200 ease-in-out",
              "md:w-64 lg:w-72 xl:w-80"
            )}
          >
            {/* Header sticky */}
            <div className="sticky top-0 z-10 bg-white dark:bg-card p-5 border-b flex items-center justify-between">
              <div className="font-bold font-yaro dark:text-white">
                {dictionary.settings}
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="text-gray-500 hover:text-black"
              >
                <ChevronLeft />
              </button>
            </div>

            {/* Search sticky */}
            <div className="sticky top-[61px] z-10 bg-white dark:bg-card px-5 pt-1 pb-2 border-b">
              <InputWithIC
                placeholder="Search.."
                icon={<Image src={SearchIc} alt="search" />}
                label=""
              />
            </div>

            {/* Menu dengan headers */}
            <nav className="px-5 py-3 space-y-1">
              {menu.map((node, idx) => {
                if (node.kind === "header") {
                  return (
                    <div
                      key={`hdr-${idx}`}
                      className="mt-4 mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {node.title}
                    </div>
                  );
                }

                const item = node;
                const activeItem = isActive(item.to);

                return (
                  <div key={`itm-${item.title}`}>
                    <div
                      className={clsx(
                        "flex items-center justify-between p-2 rounded cursor-pointer text-sm transition-colors",
                        activeItem
                          ? "bg-iprimary-blue text-white"
                          : "text-iprimary-blue dark:text-white hover:bg-iprimary-blue hover:text-white"
                      )}
                    >
                      <Link
                        href={item.subItems ? "#" : buildFull(item.to)}
                        className="flex items-center gap-2 w-full"
                        onClick={(e) => {
                          if (item.subItems) {
                            e.preventDefault();
                            setExpandedItems((prev) => ({
                              ...prev,
                              [item.title]: !prev[item.title],
                            }));
                            return;
                          }
                          if (activeItem) {
                            e.preventDefault();
                            return;
                          }
                          setIsLoading(true);
                        }}
                      >
                        {item.icon}
                        <span className="truncate">{item.title}</span>
                      </Link>

                      {item.subItems &&
                        (expandedItems[item.title] ? (
                          <ChevronUp
                            size={18}
                            onClick={() =>
                              setExpandedItems((prev) => ({
                                ...prev,
                                [item.title]: !prev[item.title],
                              }))
                            }
                          />
                        ) : (
                          <ChevronDown
                            size={18}
                            onClick={() =>
                              setExpandedItems((prev) => ({
                                ...prev,
                                [item.title]: !prev[item.title],
                              }))
                            }
                          />
                        ))}
                    </div>

                    {/* Sub-menu */}
                    {item.subItems && expandedItems[item.title] && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((sub) => {
                          const activeSub = isActive(sub.to);
                          return (
                            <Link
                              key={sub.to}
                              href={buildFull(sub.to)}
                              className={clsx(
                                "flex items-center gap-2 p-2 rounded text-sm transition-colors",
                                activeSub
                                  ? "bg-iprimary-blue text-white"
                                  : "text-iprimary-blue hover:bg-iprimary-blue hover:text-white"
                              )}
                              onClick={(e) => {
                                if (activeSub) {
                                  e.preventDefault();
                                  return;
                                }
                                setIsLoading(true);
                              }}
                            >
                              {sub.icons}
                              <span className="truncate">{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Rail (collapsed) */}
        {sidebarCollapsed && (
          <div className="hidden md:flex items-center justify-center md:w-10 border rounded-lg bg-white">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="text-gray-500 hover:text-black"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronRight />
            </button>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto rounded-lg ">
          {children}
        </main>
      </div>
    </div>
  );
}
