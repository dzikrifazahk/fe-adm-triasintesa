"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "@/context/loadingContext";
import { getDictionary } from "../../../get-dictionary";
import clsx from "clsx";
import { ClipboardCheck, FileBadge, LayoutTemplate } from "lucide-react";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["quality_control_page_dic"];
  children: React.ReactNode;
}

const menuItems = [
  {
    label: "QC Inspections",
    to: "/dashboard/qc/inspections",
    icon: ClipboardCheck,
  },
  { label: "QC Templates", to: "/dashboard/qc/templates", icon: LayoutTemplate },
  {
    label: "COA Certificates",
    to: "/dashboard/qc/coa-certificates",
    icon: FileBadge,
  },
];

export function QcMenuBar({ dictionary, children }: Props) {
  const pathname = usePathname();
  const { setIsLoading } = useLoading();
  const locale = pathname.split("/")[1] || "";

  const buildFull = (to: string) => `/${locale}${to}`;
  const isActive = (to: string) => {
    const full = buildFull(to);
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  return (
    <div
      data-page={dictionary?.title ?? "Quality Control"}
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border bg-white dark:bg-card"
    >
      <nav className="flex shrink-0 overflow-x-auto border-b">
        {menuItems.map((item, idx) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              href={buildFull(item.to)}
              onClick={(e) => {
                if (active) {
                  e.preventDefault();
                  return;
                }
                setIsLoading(true);
              }}
              className={clsx(
                "relative flex min-w-[180px] flex-1 items-center justify-center gap-3 px-4 py-3 text-sm font-medium transition-colors md:text-base",
                idx > 0 &&
                  "before:absolute before:left-0 before:top-1/2 before:h-8 before:w-px before:-translate-y-1/2 before:bg-border",
                active
                  ? "text-iprimary-blue after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-iprimary-blue"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={clsx(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                  active
                    ? "border-iprimary-blue bg-iprimary-blue text-white"
                    : "border-border bg-transparent"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <main className="min-h-0 min-w-0 flex-1 overflow-auto p-3 md:p-6">
        {children}
      </main>
    </div>
  );
}
