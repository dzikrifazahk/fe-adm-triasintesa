"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "@/context/loadingContext";
import { getDictionary } from "../../../get-dictionary";
import clsx from "clsx";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["quality_control_page_dic"];
  children: React.ReactNode;
}

const menuItems = [
  { label: "QC Inspections", to: "/dashboard/qc/inspections" },
  { label: "QC Templates", to: "/dashboard/qc/templates" },
  { label: "COA Certificates", to: "/dashboard/qc/coa-certificates" },
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
    <div className="flex h-full w-full flex-col gap-4 md:flex-row">
      <aside className="w-full shrink-0 rounded-lg border bg-white p-4 dark:bg-card md:w-64">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {dictionary?.title ?? "Quality Control"}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {dictionary?.description ??
              "Kelola QC inspection dan COA certificate."}
          </p>
        </div>

        <div className="flex flex-row gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {menuItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                href={buildFull(item.to)}
                onClick={() => setIsLoading(true)}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-iprimary-blue text-white"
                    : "text-iprimary-blue hover:bg-iprimary-blue hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>

      <main className="min-w-0 flex-1 rounded-lg border bg-white p-6 dark:bg-card">
        {children}
      </main>
    </div>
  );
}
